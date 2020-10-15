from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Semestre import Semestre
from saaacd.serializers.SemesterSerializer import SemesterSerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class SemesterView(TemplateView):
    def getSemesters(request):
        if request.method == 'GET':
            data = Semestre.objects.all()
            serializer =  SemesterSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)
