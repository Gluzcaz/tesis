from django.http import HttpResponse, JsonResponse, QueryDict
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Actividad import Actividad
from saaacd.models.Semestre import Semestre
from saaacd.models.Categoria import Categoria
from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.Dispositivo import Dispositivo
from django.contrib.auth.models import User
from saaacd.serializers.ActivitySerializer import ActivitySerializer
 
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
from django.db import connection
from saaacd.utilities.UtilityView import UtilityView

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
            serializer =  ActivitySerializer(data, many=True, fields=('id', 'estado','prioridad', 'comentario', 'fechaResolucion', 'fechaAlta', 'fechaRequerido', 'esPeticion', 'actividadSuperior', 'categoria', 'semestre', 'ubicacion', 'usuario', 'dispositivo'))
            return JsonResponse(serializer.data, safe=False)
    
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    @api_view(['GET'])
    def getActivitiesByLocation(request):
        try:
            locationId=request.GET['locationId']
            semesterId = Semestre.objects.get(esActivo=1)
            data = Actividad.objects.filter(ubicacion_id=locationId).filter(semestre_id=semesterId).exclude(estado=Actividad.REALIZADA).filter(esPeticion=0).order_by('prioridad')
            serializer = ActivitySerializer(data, many=True, fields=('id','categoria','usuario','estado','prioridad', 'fechaAlta','fechaRequerido','dispositivo'))
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
	
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    @api_view(['GET'])
    def getPetitionActivities(request):
        try:
            print(Actividad.REALIZADA)
            data = Actividad.objects.filter(esPeticion=1).exclude(estado=Actividad.REALIZADA)
            serializer = ActivitySerializer(data, many=True, fields=('id','categoria','usuario'))
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
                serializer =  ActivitySerializer(activity)               
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
                serializer =  ActivitySerializer(data=activityData, many=False,  
				                fields=( 'id', 'esPeticion','comentario', 'estado', 'prioridad', 'fechaAlta', 'fechaResolucion', 'fechaRequerido', 'semestre', 'usuario', 'actividadSuperior', 'categoria', 'ubicacion', 'dispositivo')) 
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
                      if(activityData['dispositivo'] is not None):
                         device = Dispositivo.objects.get(id=activityData['dispositivo'])
                         device_tiempoVida = activityData['tiempoVida']
                         device.save() 
                      for location in locations:
                        newActivity = Actividad(
					    id= activityId,
					    esPeticion=activityData['esPeticion'],
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

    def __addEmptyActivityCategories(data):
        categories = Categoria.objects.filter(categoriaSuperior = None).order_by('id')
        categoryDict = {}
        for i in categories:
            categoryDict[i.id]=0
        print(data)
        for object in data:
            attributes = object['data'].split(',')
            statistics = categoryDict.copy()
            values = []
            for element in attributes:
                frequencies = element.split(':')
                statistics[int(frequencies[0])]=int(frequencies[1])
            for key in sorted(statistics.keys()) :
                values.append(statistics[key])
            object['data'] = json.dumps(values)
        return data

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getActivityStadisticByInfLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            cursor = connection.cursor()
            cursor.execute('''SELECT ubicacion_id as id, nombre, centroide,
				GROUP_CONCAT(CONCAT(category_classifier, ":", frequencies) SEPARATOR ",") as data
				FROM (
					SELECT c.category_classifier, ubicacion_id, u.nombre, rg.centroide, count(*) as frequencies from saaacd_actividad a INNER JOIN 
					(SELECT sss.id, IF(ss.categoriaSuperior_id is not null, ss.categoriaSuperior_id, IF(sss.categoriaSuperior_id is null, sss.id, sss.categoriaSuperior_id)) as category_classifier
					 FROM saacd.saaacd_categoria sss  
					LEFT JOIN saacd.saaacd_categoria ss ON sss.categoriaSuperior_id=ss.id
					LEFT JOIN saacd.saaacd_categoria s ON s.id=ss.categoriaSuperior_id) as c ON a.categoria_id = c.id
					INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id = u.id 
					INNER JOIN saacd.saaacd_regiongeografica rg ON u.regionGeografica_id = rg.id
					WHERE a.semestre_id =%s AND rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
					GROUP BY category_classifier, ubicacion_id) a
					GROUP BY ubicacion_id''', [semesterId])
            data = UtilityView.dictFetchAll(cursor)
            data = ActivityView.__addEmptyActivityCategories(data)
            return JsonResponse(data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getActivityStadisticBySupLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            cursor = connection.cursor()
            cursor.execute('''SELECT location AS id, nombre, centroide,
				GROUP_CONCAT(CONCAT(category_classifier, ":", frequencies) SEPARATOR ',') AS data
				FROM (
						SELECT rg.centroide, c.category_classifier, a.location, u.nombre, count(*) as frequencies from 
						(SELECT a.semestre_id, a.categoria_id, IF(u.ubicacionSuperior_id>0, u.ubicacionSuperior_id, u.id) as location 
						from saaacd_actividad a INNER JOIN saacd.saaacd_ubicacion u ON u.id = a.ubicacion_id) AS a
						INNER JOIN (SELECT sss.id, IF(ss.categoriaSuperior_id is not null, ss.categoriaSuperior_id, IF(sss.categoriaSuperior_id is null, sss.id, sss.categoriaSuperior_id)) as category_classifier
						 FROM saacd.saaacd_categoria sss 
						LEFT JOIN saacd.saaacd_categoria ss ON sss.categoriaSuperior_id=ss.id
						LEFT JOIN saacd.saaacd_categoria s ON s.id=ss.categoriaSuperior_id) AS c ON a.categoria_id = c.id
						INNER JOIN saacd.saaacd_ubicacion u ON a.location = u.id 
						INNER JOIN saacd.saaacd_regiongeografica rg ON u.regionGeografica_id = rg.id
						WHERE a.semestre_id =%s AND rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						GROUP BY category_classifier, a.location) a
					GROUP BY location''', [semesterId])
            data = UtilityView.dictFetchAll(cursor)
            data = ActivityView.__addEmptyActivityCategories(data)
            return JsonResponse(data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getActivityMonitoringByLocation(request):
        if request.method == 'GET':
            cursor = connection.cursor()
            cursor.execute('''SELECT a.ubicacion_id AS id, a.prioridad AS data, u.nombre, rg.coordenada, rg.centroide
			FROM (SELECT count(*) frequencies, ubicacion_id, prioridad FROM saacd.saaacd_actividad 
					WHERE semestre_id=(SELECT id FROM saacd.saaacd_semestre WHERE esActivo=1) 
					      AND ubicacion_id IS NOT NULL 
						  AND esPeticion = 0
						  AND estado != %s 
						  AND estado != %s
					GROUP BY ubicacion_id, prioridad ORDER BY prioridad) a
			INNER JOIN saaacd_ubicacion u ON u.id = a.ubicacion_id
			INNER JOIN saaacd_regiongeografica rg ON rg.id = u.regionGeografica_id
			WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
			GROUP BY a.ubicacion_id ''',[Actividad.REALIZADA, Actividad.CANCELADA])
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False) 
			
