from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect

from saaacd.models.Dispositivo import Dispositivo
from saaacd.models.Ubicacion import Ubicacion
from saaacd.serializers import DeviceSerializer
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics
from django.db import connection

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

    def __dictFetchAll(cursor):
        #"Return all rows from a cursor as a dict"
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
     
    def getExpiredDevices(request):
        if request.method == 'GET':
            cursor = connection.cursor()
            cursor.execute('''SELECT d.id, 
				CONCAT(tp.nombre, " ", ma.nombre," ", mo.nombre ) AS nombre, 
				ft.precio,
				ft.existenciaInventario as cantidad
				FROM saacd.saaacd_dispositivo d 
				INNER JOIN saacd.saaacd_fichatecnica ft ON d.fichaTecnica_id = ft.id
				INNER JOIN saacd.saaacd_tipodispositivo tp ON tp.id = d.tipoDispositivo_id
				INNER JOIN saacd.saaacd_modelo mo ON mo.id = ft.modelo_id
				INNER JOIN saacd.saaacd_marca ma ON ma.id = mo.marca_id
				WHERE d.fechaBaja IS NULL 
				AND ft.prediccionVidaUtil IS NOT NULL ''') #QUERY PENDIENTE EN CANTIDAD 
            data = DeviceView.__dictFetchAll(cursor)
            return JsonResponse(data, safe=False)  	 

