from rest_framework import serializers
from saaacd.models.Actividad import Actividad
from saaacd.serializers.CategorySerializer import CategorySerializer
from saaacd.serializers.UserSerializer import UserSerializer
class SuperiorActivitySerializer(serializers.ModelSerializer):
    categoria = CategorySerializer(read_only=True) 
    usuario = UserSerializer(read_only=True) 
    class Meta:
        model = Actividad
        fields = 'id', 'categoria','usuario'