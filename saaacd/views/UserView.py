from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.views.generic import TemplateView

from django.contrib.auth.models import User
from saaacd.serializers.UserSerializer import UserSerializer
 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.conf import settings 

from rest_framework import viewsets

@method_decorator(login_required(login_url='/login/'),name="dispatch")
class UserView(TemplateView):
		
    @login_required(login_url=settings.LOGIN_REDIRECT_URL)		
    def getUsers(request):
        if request.method == 'GET':
            data = User.objects.all()
            serializer =  UserSerializer(data, many=True)
            return JsonResponse(serializer.data, safe=False)
