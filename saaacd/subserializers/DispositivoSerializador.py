from rest_framework import serializers
from saaacd.submodels.Dispositivo import Dispositivo
from saaacd.subserializers.TipoDispositivoSerializador import TipoDispositivoSerializador

class DispositivoSerializador(serializers.ModelSerializer):
    tipoDispositivo = TipoDispositivoSerializador(read_only=True) 
    
    class Meta:
        model = Dispositivo
        fields = 'id','inventarioUNAM','tipoDispositivo'