from rest_framework import serializers
from saaacd.submodels.TipoUbicacion import TipoUbicacion

class TipoUbicacionSerializador(serializers.ModelSerializer):

    class Meta:
        model = TipoUbicacion
        fields = 'id', 'nombre'