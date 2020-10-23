from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.Categoria import Categoria
from saaacd.models.Actividad import Actividad
from saaacd.models.Mapa import Mapa
from saaacd.models.RegionGeografica import RegionGeografica
from saaacd.serializers.LocationSerializer import LocationSerializer
 
from django.views.decorators.csrf import csrf_exempt
from collections import namedtuple
from django.db import connection

from rest_framework import viewsets
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework import status
from django.db import transaction
from django.db import IntegrityError

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class LocationView(TemplateView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getLocations(request):
        if request.method == 'GET':
            data = Ubicacion.objects.all()
            serializer = LocationSerializer(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior'))
            return JsonResponse(serializer.data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getSuperiorLocations(request):
        if request.method == 'GET':
            data = Ubicacion.objects.all()
            data = data.filter(ubicacionSuperior= None)
            serializer = LocationSerializer(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'regionGeografica'))
            return JsonResponse(serializer.data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
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
                serializer = LocationSerializer(data, many=True, fields=('id', 'nombre', 'tipoUbicacion', 'regionGeografica'))
                return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
        	
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
                print(isActiveMap)
                if(map.esActivo != isActiveMap):
                    map.esActivo = isActiveMap
                    map.save()
                    if( isActiveMap == 1 ):
                        maps = Mapa.objects.all()
                        for mapObject in maps:
                            if(mapObject.id != mapId):
                                mapObject.esActivo = 0
                                print("desactive map", mapObject.id)
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

		
		
