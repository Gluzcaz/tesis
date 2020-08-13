from saaacd.submodels.RegionGeografica import RegionGeografica
from rest_framework import serializers

class RegionSerializador(serializers.ModelSerializer):
    class Meta:
        model = RegionGeografica
        fields = 'id', 'coordenada', 'centroide'