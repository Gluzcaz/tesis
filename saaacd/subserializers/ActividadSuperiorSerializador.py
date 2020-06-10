from rest_framework import serializers
from saaacd.models import Actividad
from saaacd.subserializers.CategoriaSerializador import CategoriaSerializador
from saaacd.subserializers.UsuarioSerializador import UsuarioSerializador
class ActividadSuperiorSerializador(serializers.ModelSerializer):
    categoria = CategoriaSerializador(read_only=True) 
    usuario = UsuarioSerializador(read_only=True) 
    class Meta:
        model = Actividad
        fields = 'id', 'categoria','usuario'