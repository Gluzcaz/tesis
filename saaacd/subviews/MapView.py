from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.submodels.Mapa import Mapa
from saaacd.subserializers.MapaSerializador import MapaSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class MapView(TemplateView):
    def getMaps(request):
        if request.method == 'GET':
            data = Mapa.objects.all()
            serializer =  MapaSerializador(data, many=True)
            return JsonResponse(serializer.data, safe=False)
			
    def getActiveMap(request):
        if request.method == 'GET':
            data= Mapa.objects.get(esActivo=True)
            serializer =  MapaSerializador(data)
            return JsonResponse(serializer.data, safe=False)
	
	
