from rest_framework import serializers
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.subserializers.TipoUbicacionSerializador import TipoUbicacionSerializador

class UbicacionSuperiorSerializador(serializers.ModelSerializer):
    tipoUbicacion = TipoUbicacionSerializador(read_only=True) 
    class Meta:
        model = Ubicacion
        fields = 'id', 'nombre', 'tipoUbicacion'