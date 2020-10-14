from django.http import HttpResponse, JsonResponse, QueryDict
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Actividad
from saaacd.submodels.Semestre import Semestre
from saaacd.submodels.Categoria import Categoria
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.Dispositivo import Dispositivo
from django.contrib.auth.models import User
from saaacd.serializers import ActividadSerializador
 
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
import json


from rest_framework import status
from django.conf import settings 
from rest_framework.response import Response
from rest_framework.utils import json
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework.parsers import JSONParser
from django.db import transaction
from django.db import IntegrityError
from django.utils.decorators import method_decorator
from rest_framework import permissions

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class ActivityView( TemplateView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)
	
    def getDetailUrl(request, id):
        return render(request, 'index.html', context=None)
		
    def keepUrl(request):
        return render(request, 'index.html', context=None)
	
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getActivities(request):
        if request.method == 'GET':
            data = Actividad.objects.all()
            serializer =  ActividadSerializador(data, many=True, fields=('id', 'estado','prioridad', 'comentario', 'fechaResolucion', 'fechaAlta', 'fechaRequerido', 'esSiniestro', 'actividadSuperior', 'categoria', 'semestre', 'ubicacion', 'usuario', 'dispositivo'))
            return JsonResponse(serializer.data, safe=False)
			
    @api_view(['GET'])
    def getActivitiesByLocation(request):
        try:
            locationId=request.GET['locationId']
            semesterId = Semestre.objects.get(esActivo=1)
            data = Actividad.objects.filter(ubicacion_id=locationId).filter(semestre_id=semesterId).exclude(estado=Actividad.ESTADO.r).filter(esSiniestro=0)
            serializer = ActividadSerializador(data, many=True, fields=('id','categoria','usuario','estado','prioridad', 'fechaAlta','fechaRequerido','dispositivo'))
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
	
    @csrf_exempt	
    @api_view(['GET'])
    def getPetitionActivities(request):
        try:
            data = Actividad.objects.filter(esSiniestro=1).exclude(estado=Actividad.ESTADO.r)
            serializer = ActividadSerializador(data, many=True, fields=('id','categoria','usuario'))
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
			
    @csrf_exempt		
    @api_view(['DELETE', 'GET'])
    def detailActivity(request):
        try:
            if(request.GET):
                id=request.GET['id']
                activity = Actividad.objects.get(id=id)
        except Actividad.DoesNotExist: 
            return JsonResponse({'message': "Activity doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
        try:
            if request.method == 'DELETE':
                activity.delete() 
                return JsonResponse({'message': 'La actividad fue eliminada satisfactoriamente.'},safe=False, status=status.HTTP_204_NO_CONTENT)
            elif request.method == 'GET':
                serializer =  ActividadSerializador(activity)               
                return JsonResponse(serializer.data, safe=False, status=status.HTTP_201_CREATED)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	

    @csrf_exempt
    #@api_view(['POST', 'PUT']) #Shows Bad Request error with POST request
    def saveActivity(request, format=None):
        try:
            activityData = JSONParser().parse(request)
            print(request.method)
            if(request.method == 'PUT'):
                id=activityData['id']
                activity = Actividad.objects.get(id=id)
        except Actividad.DoesNotExist: 
            return JsonResponse({'message': "Activity doesn't exist."}, status=status.HTTP_404_NOT_FOUND) 
        try:
            if request.method == 'POST' or request.method == 'PUT': 
                serializer =  ActividadSerializador(data=activityData, many=False,  
				                fields=( 'id', 'esSiniestro','comentario', 'estado', 'prioridad', 'fechaAlta', 'fechaResolucion', 'fechaRequerido', 'semestre', 'usuario', 'actividadSuperior', 'categoria', 'ubicacion', 'dispositivo')) 
                if serializer.is_valid():
                    locations = []
                    if(activityData['replication']):
                      activityId = None
                      locations = Ubicacion.objects.all()
                      locations = locations.filter(ubicacionSuperior = activityData['ubicacion'])
                    else:
                      activityId= activityData['id']
                      locations.append( Ubicacion(id=activityData['ubicacion']))
					  
                    with transaction.atomic():
                      for location in locations:
                        newActivity = Actividad(
					    id= activityId,
					    esSiniestro=activityData['esSiniestro'],
					    comentario = activityData['comentario'],
					    estado = activityData['estado'],
					    prioridad = activityData['prioridad'],
					    fechaAlta = activityData['fechaAlta'],
					    fechaResolucion = activityData['fechaResolucion'],
					    fechaRequerido = activityData['fechaRequerido'],
					    semestre_id=activityData['semestre'],
					    usuario_id = activityData['usuario'],
					    ubicacion_id = location.id,
					    actividadSuperior_id = activityData['actividadSuperior'],
					    categoria_id = activityData['categoria'],
					    dispositivo_id = activityData['dispositivo'])
                        newActivity.save() 
                else:
                  print(serializer.errors)#QUITAR
                  return JsonResponse({'error': 'Serializer is not valid'}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except IntegrityError as ie: 
            return JsonResponse({'error': ie}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(activityData)				  
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        if activityId is None:
            activityId = ''
        else:
            activityId = str(newActivity.id)
        return JsonResponse({'id': activityId }, safe=False, status=status.HTTP_201_CREATED)
			
