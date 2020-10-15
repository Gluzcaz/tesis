from rest_framework import serializers
from saaacd.models.TipoDispositivo import TipoDispositivo

class DeviceTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = TipoDispositivo
        fields = 'id', 'nombre'