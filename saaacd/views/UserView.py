from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from django.contrib.auth.models import User
from saaacd.serializers.UserSerializer import UserSerializer
 
from django.views.decorators.csrf import csrf_exempt

from rest_framework import viewsets

class UserView(TemplateView):
			
    def getUsers(request):
        if request.method == 'GET':
            data = User.objects.all()
            serializer =  UserSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)
