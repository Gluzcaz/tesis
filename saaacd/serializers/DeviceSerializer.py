from rest_framework import serializers
from saaacd.models.Dispositivo import Dispositivo
from saaacd.serializers.DeviceTypeSerializer import DeviceTypeSerializer

class DeviceSerializer(serializers.ModelSerializer):
    tipoDispositivo = DeviceTypeSerializer(read_only=True) 
    
    class Meta:
        model = Dispositivo
        fields = 'id','inventarioUNAM','tipoDispositivo'