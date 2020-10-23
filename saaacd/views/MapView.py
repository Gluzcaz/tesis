from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Mapa import Mapa
from saaacd.serializers.MapSerializer import MapSerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class MapView(TemplateView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getMaps(request):
        if request.method == 'GET':
            data = Mapa.objects.all()
            serializer =  MapSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getActiveMap(request):
        if request.method == 'GET':
            data = Mapa.objects.all()
            if(data):
                data= data.get(esActivo=True)
                serializer =  MapSerializer(data)
                return JsonResponse(serializer.data, safe=False)
            else:
                return JsonResponse({}, safe=False)			
	
