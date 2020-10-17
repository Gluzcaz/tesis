from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Mapa import Mapa
from saaacd.serializers.MapSerializer import MapSerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class MapView(TemplateView):
    def getMaps(request):
        if request.method == 'GET':
            data = Mapa.objects.all()
            serializer =  MapSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)
			
    def getActiveMap(request):
        if request.method == 'GET':
            data = Mapa.objects.all()
            if(data):
                data= data.get(esActivo=True)
                serializer =  MapSerializer(data)
                return JsonResponse(serializer.data, safe=False)
            else:
                return JsonResponse({}, safe=False)			
	
