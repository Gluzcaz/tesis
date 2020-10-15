from saaacd.models.RegionGeografica import RegionGeografica
from saaacd.serializers.MapSerializer import MapSerializer

from rest_framework import serializers

class RegionSerializer(serializers.ModelSerializer):
    mapa = MapSerializer(read_only=True) 
    class Meta:
        model = RegionGeografica
        fields = 'id', 'coordenada', 'centroide', 'mapa'