from saaacd.submodels.ReporteEstadistico import ReporteEstadistico
from rest_framework import serializers

class ReporteEstadisticoSerializador(serializers.ModelSerializer):
    class Meta:
        model = ReporteEstadistico
        fields = 'id','data','centroide','nombre'

