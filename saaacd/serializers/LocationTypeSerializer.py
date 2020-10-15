from rest_framework import serializers
from saaacd.models.TipoUbicacion import TipoUbicacion

class LocationTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = TipoUbicacion
        fields = 'id', 'nombre'