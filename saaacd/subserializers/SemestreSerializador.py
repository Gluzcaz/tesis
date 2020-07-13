from saaacd.models import Semestre
from rest_framework import serializers

class SemestreSerializador(serializers.ModelSerializer):

    class Meta:
        model = Semestre
        fields = 'id', 'nombre', 'esActivo'