from saaacd.models.Semestre import Semestre
from rest_framework import serializers

class SemesterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Semestre
        fields = 'id', 'nombre', 'esActivo'