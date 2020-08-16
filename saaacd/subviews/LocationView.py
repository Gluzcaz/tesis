from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.RegionGeografica import RegionGeografica
from saaacd.subserializers.UbicacionSerializador import UbicacionSerializador
 
from django.views.decorators.csrf import csrf_exempt

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
            serializer = UbicacionSerializador(data, many=True)
            return JsonResponse(serializer.data, safe=False)
	
    def getSuperiorLocations(request):
        if request.method == 'GET':
            data = Ubicacion.objects.all()
            data = data.filter(ubicacionSuperior= None)
            serializer = UbicacionSerializador(data, many=True)
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
                serializer = UbicacionSerializador(data, many=True)
                return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
	
    @csrf_exempt
    @api_view(['PUT'])
    def saveLocations(request):
        data = JSONParser().parse(request)
        with transaction.atomic():
            for locationData in data:
                try:
                    id=locationData['id']
                    location = Ubicacion.objects.get(id=id)
                except Ubicacion.DoesNotExist: 
                    return JsonResponse({'message': "Ubicacion doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
				
                try:
                    regionId=locationData['regionGeograficaId']
                    if(regionId is not None):
                       region = RegionGeografica.objects.get(id=regionId)
                except RegionGeografica.DoesNotExist: 
                    return JsonResponse({'message': "Region doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
				
                try:
                    if(regionId is None):
                        newRegion = RegionGeografica(
									coordenada = locationData['coordenada'],
									centroide = locationData['centroide'],
									mapa_id = locationData['mapaId'])
                        newRegion.save()
                        location.regionGeografica_id = newRegion.id
                        location.save()
                    else:
                        location.regionGeografica_id = regionId
                        location.save()
                except IntegrityError as ie:
                    return JsonResponse({'error': ie}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return JsonResponse({}, safe=False, status=status.HTTP_201_CREATED)

		
		
