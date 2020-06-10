from rest_framework import serializers
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.subserializers.TipoUbicacionSerializador import TipoUbicacionSerializador
from saaacd.subserializers.UbicacionSuperiorSerializador import UbicacionSuperiorSerializador

class UbicacionSerializador(serializers.ModelSerializer):
    tipoUbicacion = TipoUbicacionSerializador(read_only=True) 
    ubicacionSuperior = UbicacionSuperiorSerializador(read_only=True)
    class Meta:
        model = Ubicacion
        fields = 'id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior'
