from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Semestre
from saaacd.serializers import SemestreSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class SemesterView(TemplateView):
    def getSemesters(request):
        if request.method == 'GET':
            data = Semestre.objects.all()
            serializer =  SemestreSerializador(data, many=True)
            return JsonResponse(serializer.data, safe=False)
