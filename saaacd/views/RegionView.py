from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Mapa import Mapa
from saaacd.utilities.MachineLearning import MachineLearning
from saaacd.serializers.RegionSerializer import RegionSerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class RegionView(TemplateView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getRegionsOnMap(request):
        if request.method == 'GET':
            try:
                mapId=request.GET['map']
                map = Mapa.objects.get(id=mapId)
            except Ubicacion.DoesNotExist: 
                return JsonResponse({'message': 'El mapa no existe.'}, status=status.HTTP_404_NOT_FOUND) 
            try:
                data = MachineLearning.getRegionCoordinates(map.imagen.path)
                serializer = RegionSerializer(data, many=True)
                return JsonResponse(serializer.data, safe=False)
            except Exception as e:
                return JsonResponse({'error': e}, safe=False, status=status.HTTP_500_INTERNAL_SERVER_ERROR)	

