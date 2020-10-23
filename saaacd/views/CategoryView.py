from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from saaacd.models.Categoria import Categoria
from saaacd.serializers.CategorySerializer import CategorySerializer
 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

from rest_framework import viewsets

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class CategoryView(TemplateView):

    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getCategories(request):
        if request.method == 'GET':
            data = Categoria.objects.all()
            serializer =  CategorySerializer(data, many=True, fields=('id', 'nombre', 'categoriaSuperior'))
            return JsonResponse(serializer.data, safe=False)
			
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)
    def getSuperiorCategories(request):
        if request.method == 'GET':
            data = Categoria.objects.filter(categoriaSuperior = None).order_by('id')
            serializer =  CategorySerializer(data, many=True, fields=('id', 'nombre'))
            return JsonResponse(serializer.data, safe=False)

