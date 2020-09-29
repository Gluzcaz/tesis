from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.Categoria import Categoria
from saaacd.submodels.ReporteEstadistico import ReporteEstadistico
from saaacd.submodels.Mapa import Mapa
from saaacd.submodels.RegionGeografica import RegionGeografica
from saaacd.subserializers.UbicacionSerializador import UbicacionSerializador
from saaacd.subserializers.ReporteEstadisticoSerializador import ReporteEstadisticoSerializador
 
from django.views.decorators.csrf import csrf_exempt
import json

from rest_framework import viewsets
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework import status
from django.db import transaction
from django.db import IntegrityError

class LocationView(TemplateView):
    def getLocations(request):
        if request.method == 'GET':
            data = Ubicacion.objects.all()
            serializer = UbicacionSerializador(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior'))
            return JsonResponse(serializer.data, safe=False)
	
    def getSuperiorLocations(request):
        if request.method == 'GET':
            data = Ubicacion.objects.all()
            data = data.filter(ubicacionSuperior= None)
            serializer = UbicacionSerializador(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'regionGeografica'))
            return JsonResponse(serializer.data, safe=False)
			
    def getInferiorLocations(request):
        try:
            location=request.GET['location']
            locationObject = Ubicacion.objects.get(id=location)
        except Ubicacion.DoesNotExist: 
            return JsonResponse({'message': 'La ubicación superior no existe.'}, status=status.HTTP_404_NOT_FOUND) 
        try:
            data = Ubicacion.objects.all()
            if location is not None:
                data = data.filter(ubicacionSuperior=location)
                serializer = UbicacionSerializador(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'regionGeografica'))
                return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
	
    def __addEmptyActivityCategories(data):
        categories = Categoria.objects.filter(categoriaSuperior = None).order_by('categoriaSuperior')
        categoryDict = {}
        for i in categories:
            categoryDict[i.id]=0
        for object in data:
            attributes = object['data'].split(',')
            stadistics = categoryDict.copy()
            for element in attributes:
                frequencies = element.split(':')
                stadistics[int(frequencies[0])]=int(frequencies[1])
            object['data'] = json.dumps(list(stadistics.values()))
        return data
			
    def getActivityStadisticByInfLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            data = ReporteEstadistico.objects.raw('''SELECT ubicacion_id as id, nombre, centroide,
				GROUP_CONCAT(CONCAT(category_classifier, ":", frequencies) SEPARATOR ",") as data
				FROM (
					SELECT c.category_classifier, ubicacion_id, u.nombre, rg.centroide, count(*) as frequencies from saaacd_actividad a INNER JOIN 
					(SELECT sss.id, IF(ss.categoriaSuperior_id>0, ss.categoriaSuperior_id, sss.categoriaSuperior_id) as category_classifier
					 FROM saacd.saaacd_categoria sss  
					LEFT JOIN saacd.saaacd_categoria ss ON sss.categoriaSuperior_id=ss.id
					LEFT JOIN saacd.saaacd_categoria s ON s.id=ss.categoriaSuperior_id) as c ON a.categoria_id = c.id
					INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id = u.id 
					INNER JOIN saacd.saaacd_regiongeografica rg ON u.regionGeografica_id = rg.id
					WHERE a.semestre_id =%s AND rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
					GROUP BY category_classifier, ubicacion_id) a
					GROUP BY ubicacion_id''', [semesterId])
            serializer = ReporteEstadisticoSerializador(data, many=True)
            data = LocationView.__addEmptyActivityCategories(serializer.data)
            return JsonResponse(data, safe=False)
	
    def getActivityStadisticBySupLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            data = ReporteEstadistico.objects.raw('''SELECT location AS id, nombre, centroide,
				GROUP_CONCAT(CONCAT(category_classifier, ":", frequencies) SEPARATOR ',') AS data
				FROM (
						SELECT rg.centroide, c.category_classifier, a.location, u.nombre, count(*) as frequencies from 
						(SELECT a.semestre_id, a.categoria_id, IF(u.ubicacionSuperior_id>0, u.ubicacionSuperior_id, u.id) as location 
						from saaacd_actividad a INNER JOIN saacd.saaacd_ubicacion u ON u.id = a.ubicacion_id) AS a
						INNER JOIN (SELECT sss.id, IF(ss.categoriaSuperior_id>0, ss.categoriaSuperior_id, sss.categoriaSuperior_id) as category_classifier
						 FROM saacd.saaacd_categoria sss 
						LEFT JOIN saacd.saaacd_categoria ss ON sss.categoriaSuperior_id=ss.id
						LEFT JOIN saacd.saaacd_categoria s ON s.id=ss.categoriaSuperior_id) AS c ON a.categoria_id = c.id
						INNER JOIN saacd.saaacd_ubicacion u ON a.location = u.id 
						INNER JOIN saacd.saaacd_regiongeografica rg ON u.regionGeografica_id = rg.id
						WHERE a.semestre_id =%s AND rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						GROUP BY category_classifier, a.location) a
					GROUP BY location''', [semesterId])
            serializer = ReporteEstadisticoSerializador(data, many=True)
            data = LocationView.__addEmptyActivityCategories(serializer.data)
            return JsonResponse(data, safe=False)

    @csrf_exempt
    @api_view(['PUT'])
    def saveLocations(request):
        data = JSONParser().parse(request)
        generalElements = data.pop(0)
        mapId = generalElements['mapaId']
        isActiveMap = generalElements['esActivo']
        try:
            map = Mapa.objects.get(id=mapId)
        except Mapa.DoesNotExist: 
            return JsonResponse({'message': "Map doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
        
        try:
    	    with transaction.atomic():
                if(map.esActivo != isActiveMap):
                    map.esActivo = isActiveMap
                    map.save()
                    if( isActiveMap == 1 ):
                        maps = Mapa.objects.all()
                        for mapObject in maps:
                            if(mapObject.id != mapId):
                                mapObject.esActivo = 0
                                mapObject.save()
                            						
                for locationData in data:
                    try:
    	                id=locationData['id']
    	                location = Ubicacion.objects.get(id=id)
                    except Ubicacion.DoesNotExist: 
    	                return JsonResponse({'message': "Location doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
					
                    try:
    	                regionId=locationData['regionGeograficaId']
    	                if(regionId is not None):
    	                   region = RegionGeografica.objects.get(id=regionId)
                    except RegionGeografica.DoesNotExist: 
    	                return JsonResponse({'message': "Region doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
					
                    if(regionId is None):
    	                newRegion = RegionGeografica(
										coordenada = locationData['coordenada'],
										centroide = locationData['centroide'],
										mapa_id = mapId)
    	                newRegion.save()
    	                location.regionGeografica_id = newRegion.id
    	                location.save()
                    else:
    	                location.regionGeografica_id = regionId
    	                location.save()
    	            
        except IntegrityError as ie: 
            return JsonResponse({'error': ie}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return JsonResponse({'mapName': map.nombre}, safe=False, status=status.HTTP_201_CREATED)

		
		
