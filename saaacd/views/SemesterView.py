from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Semestre import Semestre
from saaacd.serializers.SemesterSerializer import SemesterSerializer
 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

from rest_framework import viewsets

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class SemesterView(TemplateView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getSemesters(request):
        if request.method == 'GET':
            data = Semestre.objects.all()
            serializer =  SemesterSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)			
    def getPredictiveSemesters(request):
        if request.method == 'GET':
            activeSemester = Semestre.objects.get(esActivo=1)
            data = Semestre.objects.all().filter(fin__gte= activeSemester.fin)
            serializer =  SemesterSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)
