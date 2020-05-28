from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Actividad
from saaacd.serializers import ActividadSerializador
 
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.utils import json
from rest_framework import serializers
from rest_framework import viewsets

from rest_framework.parsers import JSONParser 
 
#from data.models import Customer
  
class HomePageView(TemplateView):
    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)
#    @login_required
    @csrf_exempt	
    def getActivities(request):
        data = Actividad.objects.all()
        if request.method == 'GET':
            serializer =  ActividadSerializador(data, many=True)
            return JsonResponse(serializer.data, safe=False)
		
    @api_view(['DELETE', 'PUT'])
    def detailActivity(request):
        try:
           id=str(request.GET['id'])
           activity = Actividad.objects.get(id=id) 
        except Actividad.DoesNotExist: 
            return JsonResponse({'message': 'La actividad no existe.'}, status=status.HTTP_404_NOT_FOUND) 

        if request.method == 'DELETE':
            activity.delete() 
            return JsonResponse({'message': 'La actividad fue eliminada satisfactoriamente.'}, status=status.HTTP_204_NO_CONTENT)


			
#class LinksPageView(TemplateView):
#    def get(self, request, **kwargs):
#        return render(request, 'links.html', context=None)
 
#class Customers(TemplateView):
#    def getCust(request):
#        name='liran'
#        return HttpResponse('{ "name":"' + name + '", "age":31, "city":"New York" }')

