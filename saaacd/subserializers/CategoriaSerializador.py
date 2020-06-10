from rest_framework import serializers
from saaacd.submodels.Categoria import Categoria

class CategoriaSerializador(serializers.ModelSerializer):

    class Meta:
        model = Categoria
        fields = 'id', 'nombre'