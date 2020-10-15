from saaacd.models.Categoria import Categoria
from saaacd.serializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class CategorySerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Categoria
        fields = 'id', 'nombre','categoriaSuperior'
        depth = 2