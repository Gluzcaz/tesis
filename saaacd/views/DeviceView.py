from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect

from saaacd.models.Dispositivo import Dispositivo
from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.Semestre import Semestre
from saaacd.serializers.DeviceSerializer import DeviceSerializer
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from django.db import connection
from saaacd.utilities.UtilityView import UtilityView
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class DeviceView(generics.ListAPIView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)		
    @api_view(['GET'])
    def getDevicesByLocation(request):
        try:
            location=request.GET['location']
            locationObject = Ubicacion.objects.get(id=location)
        except Ubicacion.DoesNotExist: 
            return JsonResponse({'message': 'La ubicación no existe.'}, status=status.HTTP_404_NOT_FOUND) 
        try:
            data = Dispositivo.objects.all()
            if location is not None:
                data = data.filter(ubicacion=location).filter(fechaBaja=None)
                serializer = DeviceSerializer(data, many=True)
                return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)    
    def getExpiredDevices(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)
            if semester.esActivo == 1:
                sql = '''SELECT d.id, 
				CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre, 
				ft.precio,
				COUNT(*) as cantidad
				FROM saacd.saaacd_dispositivo d 
				INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
				INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
				INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
				INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
				WHERE d.fechaBaja IS NULL 
				AND d.prediccionVidaUtil IS NOT NULL 
                AND d.tiempoVida >= d.prediccionVidaUtil
                GROUP BY ft.id'''
                params=[]
            else:
                sql='''SELECT d.id, 
				CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre, 
				ft.precio,
				COUNT(*) as cantidad
				FROM saacd.saaacd_dispositivo d 
				INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
				INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
				INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
				INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                INNER JOIN(	SELECT SUM(h.horasClase) predictionTime, h.ubicacion_id
										FROM ( SELECT semestre_id, diaHabil FROM saacd.saaacd_calendario
											   WHERE diaHabil BETWEEN CURRENT_DATE AND %s ) c
									   INNER JOIN (SELECT ie.semestre_id, hc.diaSemana, hc.horasClase, ie.ubicacion_id 
													FROM saacd.saaacd_horarioclase hc
													INNER JOIN saacd.saaacd_informacionescolar ie ON ie.id=hc.infoEscolar_id) h
														ON DAYOFWEEK(c.diaHabil)=h.diaSemana AND h.semestre_id=c.semestre_id
										GROUP BY h.ubicacion_id
				) cs ON  d.ubicacion_id= cs.ubicacion_id
				WHERE d.fechaBaja IS NULL 
				AND d.prediccionVidaUtil IS NOT NULL 
                AND d.tiempoVida + cs.predictionTime >= d.prediccionVidaUtil
                GROUP BY ft.id'''
                params=[semester.fin]
            cursor = connection.cursor()
            cursor.execute(sql,params)
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False)  	

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getDeviceLifeTimeByLocation(request):
        if request.method == 'GET':
            locationId = request.GET['locationId']
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)

            if semester.esActivo == 1:
                sql='''SELECT d.id, CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre ,
					(d.tiempoVida/ d.prediccionVidaUtil)*100  AS data
					FROM saacd.saaacd_dispositivo d 
					INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
                    INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
					INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
                    INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                    WHERE d.fechaBaja IS NULL 
					AND d.prediccionVidaUtil IS NOT NULL 
                    AND  d.ubicacion_id = %s
                    ORDER BY d.tiempoVida DESC'''
                params=[locationId]
            else:
                sql = '''SELECT d.id, CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre ,
					((d.tiempoVida + s.nextSemesters)/ d.prediccionVidaUtil)*100  AS data
					FROM saacd.saaacd_dispositivo d 
					INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
                    INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
					INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
                    INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                    INNER JOIN (SELECT SUM(h.horasClase) nextSemesters, h.ubicacion_id
										FROM ( SELECT semestre_id, diaHabil FROM saacd.saaacd_calendario
											   WHERE diaHabil BETWEEN CURRENT_DATE AND %s ) c
									   INNER JOIN (SELECT ie.semestre_id, hc.diaSemana, hc.horasClase, ie.ubicacion_id 
													FROM saacd.saaacd_horarioclase hc
													INNER JOIN saacd.saaacd_informacionescolar ie ON ie.id=hc.infoEscolar_id
													WHERE ie.ubicacion_id =%s) h
														ON DAYOFWEEK(c.diaHabil)=h.diaSemana AND h.semestre_id=c.semestre_id
										GROUP BY h.ubicacion_id) s ON  d.ubicacion_id= s.ubicacion_id
					WHERE d.fechaBaja IS NULL 
					AND d.prediccionVidaUtil IS NOT NULL 
                    AND  d.ubicacion_id = %s
                    ORDER BY d.tiempoVida DESC'''
                params = [semester.fin, locationId, locationId]				
            cursor = connection.cursor()
            cursor.execute(sql, params)
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False) 

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getDeviceMonitoringByLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)
            if semester.esActivo == 1:
                sql = '''SELECT a.ubicacion_id AS id, a.prioridad AS data, u.nombre, rg.coordenada, rg.centroide 
						FROM (
							SELECT d.id, d.ubicacion_id,
							IF(d.tiempoVida >=  d.prediccionVidaUtil, 1, 
							IF(d.tiempoVida + m.nextMonth >= d.prediccionVidaUtil, 2, 0)) as prioridad 
							FROM saacd.saaacd_dispositivo d 
							LEFT JOIN (SELECT SUM(h.horasClase) nextMonth, h.ubicacion_id
										FROM ( SELECT semestre_id, diaHabil FROM saacd.saaacd_calendario
											   WHERE diaHabil BETWEEN CURRENT_DATE AND DATE_ADD(%s, INTERVAL 1 MONTH) ) c
									    INNER JOIN (SELECT ie.semestre_id, hc.diaSemana, hc.horasClase, ie.ubicacion_id 
													FROM saacd.saaacd_horarioclase hc
													INNER JOIN saacd.saaacd_informacionescolar ie ON ie.id=hc.infoEscolar_id) h
														ON DAYOFWEEK(c.diaHabil)=h.diaSemana AND h.semestre_id=c.semestre_id
										GROUP BY h.ubicacion_id) m ON  d.ubicacion_id= m.ubicacion_id
							WHERE fechaBaja IS NULL 
							AND d.prediccionVidaUtil IS NOT NULL 
							ORDER BY prioridad
						) a
						INNER JOIN saaacd_ubicacion u ON u.id = a.ubicacion_id
						INNER JOIN saaacd_regiongeografica rg ON rg.id = u.regionGeografica_id
						WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						AND a.prioridad > 0
						GROUP BY a.ubicacion_id'''
                params = [semester.fin]
            else:#PENDIENTE: Cambiar LEFT JOIN (SELECT SUM(h.horasClase) nextMonth,... por INNER JOIN cuando esté poblada la bd
                sql = '''SELECT a.ubicacion_id AS id, a.prioridad AS data, u.nombre, rg.coordenada, rg.centroide
						FROM (
							SELECT d.id, d.ubicacion_id,
							IF(d.tiempoVida + s.nextSemesters >=  d.prediccionVidaUtil, 1, 
							IF(d.tiempoVida + s.nextSemesters + m.nextMonth >= d.prediccionVidaUtil, 2, 0)) as prioridad 
							FROM saacd.saaacd_dispositivo d 
							INNER JOIN (SELECT SUM(h.horasClase) nextSemesters, h.ubicacion_id
										FROM ( SELECT semestre_id, diaHabil FROM saacd.saaacd_calendario
											   WHERE diaHabil BETWEEN CURRENT_DATE AND %s ) c
									   INNER JOIN (SELECT ie.semestre_id, hc.diaSemana, hc.horasClase, ie.ubicacion_id 
													FROM saacd.saaacd_horarioclase hc
													INNER JOIN saacd.saaacd_informacionescolar ie ON ie.id=hc.infoEscolar_id) h
														ON DAYOFWEEK(c.diaHabil)=h.diaSemana AND h.semestre_id=c.semestre_id
										GROUP BY h.ubicacion_id) s ON  d.ubicacion_id= s.ubicacion_id
							LEFT JOIN (SELECT SUM(h.horasClase) nextMonth, h.ubicacion_id
										FROM ( SELECT semestre_id, diaHabil FROM saacd.saaacd_calendario
											   WHERE diaHabil BETWEEN DATE_ADD(%s, INTERVAL 1 DAY)
											   AND DATE_ADD(%s, INTERVAL 1 MONTH) ) c
									   INNER JOIN (SELECT ie.semestre_id, hc.diaSemana, hc.horasClase, ie.ubicacion_id 
													FROM saacd.saaacd_horarioclase hc
													INNER JOIN saacd.saaacd_informacionescolar ie ON ie.id=hc.infoEscolar_id) h
														ON DAYOFWEEK(c.diaHabil)=h.diaSemana AND h.semestre_id=c.semestre_id
										GROUP BY h.ubicacion_id) m ON  d.ubicacion_id= m.ubicacion_id
							WHERE fechaBaja IS NULL 
							AND d.prediccionVidaUtil IS NOT NULL 
							ORDER BY prioridad
						) a
						INNER JOIN saaacd_ubicacion u ON u.id = a.ubicacion_id
						INNER JOIN saaacd_regiongeografica rg ON rg.id = u.regionGeografica_id
						WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						AND a.prioridad > 0
						GROUP BY a.ubicacion_id	'''
                params = [semester.fin, semester.fin, semester.fin]
            cursor = connection.cursor()
            cursor.execute(sql, params)
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False) 

    def __addEmptyMaterialCategories(data):
        categories = [0,0,0] #Extravío,'Falla','Queja'
        for object in data:
            attributes = object['data'].split(',')
            stadistics = categories[:]
            for element in attributes:
                frequencies = element.split(':')
                stadistics[int(frequencies[0])]=int(frequencies[1])
            object['data'] = json.dumps(stadistics)
        return data			

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)		
    def getDeviceStadisticBySupLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            cursor = connection.cursor()
            cursor.execute('''SELECT  ubicacion_id AS id, locationName AS nombre, rg.centroide,
			GROUP_CONCAT(CONCAT(categoryName, ":", frequencies) SEPARATOR ",") as data
			 FROM 
			(
				SELECT '0' as categoryName, su.regionGeografica_id as regionId, count(*) frequencies,
					IF(u.ubicacionSuperior_id>0, su.nombre, u.nombre) as locationName, 
					IF(u.ubicacionSuperior_id>0, u.ubicacionSuperior_id, u.id) AS ubicacion_id
				FROM saacd.saaacd_actividad a 
				INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				INNER JOIN saacd.saaacd_ubicacion su ON u.ubicacionSuperior_id=su.id 
				WHERE a.esPeticion = 0 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s AND INSTR(UPPER(c.nombre), "EXTRAVÍO") > 0
				GROUP BY a.ubicacion_id
				UNION
				(SELECT '1' as categoryName, su.regionGeografica_id as regionId, count(*) frequencies,
					IF(u.ubicacionSuperior_id>0, su.nombre, u.nombre) as locationName, 
					IF(u.ubicacionSuperior_id>0, u.ubicacionSuperior_id, u.id) AS ubicacion_id 
				FROM saacd.saaacd_actividad a 
				INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				INNER JOIN saacd.saaacd_ubicacion su ON u.ubicacionSuperior_id=su.id 
				WHERE a.esPeticion = 0 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s AND INSTR(UPPER(c.nombre), "FALLA") > 0
				GROUP BY a.ubicacion_id)
				UNION
				(SELECT '2' as categoryName, su.regionGeografica_id as regionId, count(*) frequencies,
					IF(u.ubicacionSuperior_id>0, su.nombre, u.nombre) as locationName, 
					IF(u.ubicacionSuperior_id>0, u.ubicacionSuperior_id, u.id) AS ubicacion_id
				 FROM saacd.saaacd_actividad a 
				 INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				 INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				 INNER JOIN saacd.saaacd_ubicacion su ON u.ubicacionSuperior_id=su.id 
				 WHERE a.esPeticion = 1 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s 
				 GROUP BY a.ubicacion_id)
			 ) b
			 INNER JOIN saacd.saaacd_regiongeografica rg ON rg.id = b.regionId
			 WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
			GROUP BY ubicacion_id''', [semesterId, semesterId, semesterId])
            data = UtilityView.dictFetchAll(cursor)
            data = DeviceView.__addEmptyMaterialCategories(data)
            print(data)
            return JsonResponse(data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getDeviceStadisticByInfLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            cursor = connection.cursor()
            cursor.execute('''SELECT  ubicacion_id AS id, locationName AS nombre, rg.centroide,
			GROUP_CONCAT(CONCAT(categoryName, ":", frequencies) SEPARATOR ",") as data
			 FROM 
			(
				SELECT '0' as categoryName, u.regionGeografica_id as regionId, a.ubicacion_id, u.nombre as locationName, count(*) frequencies FROM saacd.saaacd_actividad a 
				INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				WHERE a.esPeticion = 0 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s AND INSTR(UPPER(c.nombre), "EXTRAVÍO") > 0
				GROUP BY a.ubicacion_id
				UNION
				(SELECT '1' as categoryName, u.regionGeografica_id as regionId,  a.ubicacion_id, u.nombre as locationName, count(*) frequencies FROM saacd.saaacd_actividad a 
				INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				WHERE a.esPeticion = 0 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s AND INSTR(UPPER(c.nombre), "FALLA") > 0
				GROUP BY a.ubicacion_id)
				UNION
				(SELECT '2' as categoryName, u.regionGeografica_id as regionId,  a.ubicacion_id, u.nombre as locationName, count(*) frequencies
				 FROM saacd.saaacd_actividad a 
				 INNER JOIN saacd.saaacd_categoria c ON a.categoria_id=c.id 
				 INNER JOIN saacd.saaacd_ubicacion u ON a.ubicacion_id=u.id 
				 WHERE a.esPeticion = 1 AND a.dispositivo_id IS NOT NULL AND a.semestre_id=%s 
				 GROUP BY a.ubicacion_id)
			 ) b
			 INNER JOIN saacd.saaacd_regiongeografica rg ON rg.id = b.regionId
			 WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
			GROUP BY id''', [semesterId, semesterId, semesterId])
            data = UtilityView.dictFetchAll(cursor)
            data = DeviceView.__addEmptyMaterialCategories(data)
            return JsonResponse(data, safe=False)
			

