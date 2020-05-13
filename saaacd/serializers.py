from rest_framework import serializers
from saaacd.models import Actividad

class ActividadSerializador(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = ('id', 'nombre')