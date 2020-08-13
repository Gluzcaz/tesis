from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models import Categoria
from saaacd.serializers import CategoriaSerializador
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class CategoryView(TemplateView):
    def getCategories(request):
        if request.method == 'GET':
            data = Categoria.objects.all()
            serializer =  CategoriaSerializador(data, many=True, fields=('id', 'nombre', 'categoriaSuperior'))
            return JsonResponse(serializer.data, safe=False)

