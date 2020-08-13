from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Ubicacion
from saaacd.subserializers.UbicacionSerializador import UbicacionSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

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

