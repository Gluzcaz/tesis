from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Categoria import Categoria
from saaacd.serializers.CategorySerializer import CategorySerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class CategoryView(TemplateView):
    def getCategories(request):
        if request.method == 'GET':
            data = Categoria.objects.all()
            serializer =  CategorySerializer(data, many=True, fields=('id', 'nombre', 'categoriaSuperior'))
            return JsonResponse(serializer.data, safe=False)

    def getSuperiorCategories(request):
        if request.method == 'GET':
            data = Categoria.objects.filter(categoriaSuperior = None).order_by('id')
            serializer =  CategorySerializer(data, many=True, fields=('id', 'nombre'))
            return JsonResponse(serializer.data, safe=False)

