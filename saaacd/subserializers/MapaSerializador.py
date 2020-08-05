from saaacd.submodels.Mapa import Mapa
from rest_framework import serializers
from saaacd.subserializers.TipoUbicacionSerializador import TipoUbicacionSerializador

class MapaSerializador(serializers.ModelSerializer):
    tipoUbicacion = TipoUbicacionSerializador(read_only=True) 
    class Meta:
        model = Mapa
        fields = 'id', 'nombre', 'imagen', 'tipoUbicacion'