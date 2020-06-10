from rest_framework import serializers
from django.contrib.auth.models import User

class UsuarioSerializador(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = 'id','first_name'