from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Actividad
from saaacd.serializers import ActividadSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils import json
from rest_framework import serializers
from rest_framework import viewsets
 
#from data.models import Customer
  
class HomePageView(TemplateView):
    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)
    @csrf_exempt
    def getActivities(request):
        data = Actividad.objects.all()
        if request.method == 'GET':
            serializer =  ActividadSerializador(data, many=True)
            return JsonResponse(serializer.data, safe=False)
		
#class LinksPageView(TemplateView):
#    def get(self, request, **kwargs):
#        return render(request, 'links.html', context=None)
 
#class Customers(TemplateView):
#    def getCust(request):
#        name='liran'
#        return HttpResponse('{ "name":"' + name + '", "age":31, "city":"New York" }')

