from rest_framework import serializers
from saaacd.models.Ubicacion import Ubicacion
from saaacd.serializers.LocationTypeSerializer import LocationTypeSerializer

class SuperiorLocationSerializer(serializers.ModelSerializer):
    tipoUbicacion = LocationTypeSerializer(read_only=True) 
    class Meta:
        model = Ubicacion
        fields = 'id', 'nombre', 'tipoUbicacion'