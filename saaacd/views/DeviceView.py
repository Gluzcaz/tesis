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

class DeviceView(generics.ListAPIView):
    @csrf_exempt		
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
     
    def getExpiredDevices(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)
            activeSemester = Semestre.objects.get(esActivo=1)
            cursor = connection.cursor()
            cursor.execute('''SELECT d.id, 
				CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre, 
				ft.precio,
				COUNT(*) as cantidad
				FROM saacd.saaacd_dispositivo d 
				INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
				INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
				INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
				INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                INNER JOIN(SELECT ubicacion_id, 
								SUM(duracionSemestral) AS predictionTime
								FROM saacd.saaacd_horarioclase hc
                                INNER JOIN saacd.saaacd_semestre s ON hc.semestre_id = s.id
                                WHERE s.fin <= %s 
									AND s.fin > %s
								GROUP BY ubicacion_id) cs ON  d.ubicacion_id= cs.ubicacion_id
				WHERE d.fechaBaja IS NULL 
				AND ft.prediccionVidaUtil IS NOT NULL 
                AND d.tiempoVida + cs.predictionTime >= ft.prediccionVidaUtil
                GROUP BY ft.id''',[semester.fin, activeSemester.fin])
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False)  	
			
    def getDeviceLifeTimeByLocation(request):
        if request.method == 'GET':
            locationId = request.GET['locationId']
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)

            if semester.esActivo == 1:
                sql='''SELECT d.id, CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre ,
					(d.tiempoVida/ ft.prediccionVidaUtil)*100  AS data
					FROM saacd.saaacd_dispositivo d 
					INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
                    INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
					INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
                    INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                    WHERE d.fechaBaja IS NULL 
					AND ft.prediccionVidaUtil IS NOT NULL 
                    AND  d.ubicacion_id = %s
                    ORDER BY d.tiempoVida DESC'''
                params=[locationId]
            else:
                sql = '''SELECT d.id, CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre ,
					((d.tiempoVida + cs.predictionTime)/ ft.prediccionVidaUtil)*100  AS data
					FROM saacd.saaacd_dispositivo d 
					INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
                    INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
					INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
                    INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
                    INNER JOIN(SELECT ubicacion_id, 
								SUM(duracionSemestral) AS predictionTime
								FROM saacd.saaacd_horarioclase hc
                                INNER JOIN saacd.saaacd_semestre s ON hc.semestre_id = s.id
                                WHERE s.fin <= %s 
									AND s.fin > %s
								GROUP BY ubicacion_id) cs ON  d.ubicacion_id= cs.ubicacion_id
					WHERE d.fechaBaja IS NULL 
					AND ft.prediccionVidaUtil IS NOT NULL 
                    AND  d.ubicacion_id = %s
                    ORDER BY d.tiempoVida DESC'''
                activeSemester = Semestre.objects.get(esActivo=1)
                params = [semester.fin, activeSemester.fin, locationId]				
            cursor = connection.cursor()
            cursor.execute(sql, params)
            data = UtilityView.dictFetchAll(cursor)
            return JsonResponse(data, safe=False) 
	
    def getDeviceMonitoringByLocation(request):
        if request.method == 'GET':
            semesterId = request.GET['semesterId']
            semester = Semestre.objects.get(id=semesterId)
            activeSemester = Semestre.objects.get(esActivo=1)
            if semester.esActivo == 1:
                sql = '''SELECT a.ubicacion_id AS id, a.prioridad AS data, u.nombre, rg.coordenada, rg.centroide 
						FROM (
							SELECT d.id, d.ubicacion_id,
								IF(d.tiempoVida >=  ft.prediccionVidaUtil, 1, 
								IF(d.tiempoVida + ns.duracionMensual >= ft.prediccionVidaUtil, 2, 0)) as prioridad 
								FROM saacd.saaacd_dispositivo d 
								INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
								INNER JOIN (SELECT ubicacion_id, duracionMensual FROM saacd.saaacd_horarioclase  
											WHERE semestre_id= %s) ns ON  d.ubicacion_id= ns.ubicacion_id
								WHERE fechaBaja IS NULL AND 
								ft.prediccionVidaUtil IS NOT NULL ORDER BY prioridad
						) a
						INNER JOIN saaacd_ubicacion u ON u.id = a.ubicacion_id
						INNER JOIN saaacd_regiongeografica rg ON rg.id = u.regionGeografica_id
						WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						GROUP BY a.ubicacion_id'''
                params = [semester.id]
            else:
                sql = '''SELECT a.ubicacion_id AS id, a.prioridad AS data, u.nombre, rg.coordenada, rg.centroide
						FROM (
							SELECT d.id, d.ubicacion_id, 
								IF(d.tiempoVida + cs.predictionTime >=  ft.prediccionVidaUtil, 1, 
								IF(d.tiempoVida + cs.predictionTime + ns.duracionMensual >= ft.prediccionVidaUtil, 2, 0)) as prioridad 
								FROM saacd.saaacd_dispositivo d 
								INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
								INNER JOIN (SELECT ubicacion_id, duracionMensual FROM saacd.saaacd_horarioclase  
											WHERE semestre_id= %s) ns ON  d.ubicacion_id= ns.ubicacion_id
								INNER JOIN(SELECT ubicacion_id, 
											SUM(duracionSemestral) AS predictionTime
											FROM saacd.saaacd_horarioclase hc
											INNER JOIN saacd.saaacd_semestre s ON hc.semestre_id = s.id
											WHERE s.fin <= %s 
												AND s.fin > %s
											GROUP BY ubicacion_id) cs ON  d.ubicacion_id= cs.ubicacion_id
								WHERE fechaBaja IS NULL AND 
								ft.prediccionVidaUtil IS NOT NULL ORDER BY prioridad
						) a
						INNER JOIN saaacd_ubicacion u ON u.id = a.ubicacion_id
						INNER JOIN saaacd_regiongeografica rg ON rg.id = u.regionGeografica_id
						WHERE rg.mapa_id = (SELECT id FROM saacd.saaacd_mapa WHERE esActivo=1)
						GROUP BY a.ubicacion_id	'''
                params = [semesterId, semester.fin, activeSemester.fin]
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
			GROUP BY id''', [semesterId, semesterId, semesterId])
            data = UtilityView.dictFetchAll(cursor)
            data = DeviceView.__addEmptyMaterialCategories(data)
            return JsonResponse(data, safe=False)
			
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
			

