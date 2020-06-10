from rest_framework import serializers
from saaacd.models import Semestre

class SemestreSerializador(serializers.ModelSerializer):

    class Meta:
        model = Semestre
        fields = 'id', 'nombre'