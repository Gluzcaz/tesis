from saaacd.submodels.RegionGeografica import RegionGeografica
from saaacd.subserializers.MapaSerializador import MapaSerializador

from rest_framework import serializers

class RegionSerializador(serializers.ModelSerializer):
    mapa = MapaSerializador(read_only=True) 
    class Meta:
        model = RegionGeografica
        fields = 'id', 'coordenada', 'centroide', 'mapa'