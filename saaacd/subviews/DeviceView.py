from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect

from saaacd.models import Dispositivo
from saaacd.models import Ubicacion
from saaacd.serializers import DispositivoSerializador
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics

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
                data = data.filter(ubicacion=location)
                serializer = DispositivoSerializador(data, many=True)
                return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	
            

