from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.submodels.Mapa import Mapa
from saaacd.utilities.MachineLearning import MachineLearning
from saaacd.subserializers.RegionSerializador import RegionSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class RegionView(TemplateView):
    def getRegionsOnMap(request):
        if request.method == 'GET':
            try:
                mapId=request.GET['map']
                map = Mapa.objects.get(id=mapId)
            except Ubicacion.DoesNotExist: 
                return JsonResponse({'message': 'El mapa no existe.'}, status=status.HTTP_404_NOT_FOUND) 
            try:
                data = MachineLearning.getRegionCoordinates(map.imagen.path)
                serializer = RegionSerializador(data, many=True)
                return JsonResponse(serializer.data, safe=False)
            except Exception as e:
                return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	

