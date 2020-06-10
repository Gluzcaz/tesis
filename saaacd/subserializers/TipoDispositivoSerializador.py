from rest_framework import serializers
from saaacd.submodels.TipoDispositivo import TipoDispositivo

class TipoDispositivoSerializador(serializers.ModelSerializer):

    class Meta:
        model = TipoDispositivo
        fields = 'id', 'nombre'