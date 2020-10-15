from saaacd.models.Mapa import Mapa
from rest_framework import serializers
from saaacd.serializers.LocationTypeSerializer import LocationTypeSerializer

class MapSerializer(serializers.ModelSerializer):
    tipoUbicacion = LocationTypeSerializer(read_only=True) 
    class Meta:
        model = Mapa
        fields = 'id', 'nombre', 'imagen', 'tipoUbicacion', 'esActivo'
