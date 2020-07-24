from saaacd.submodels.Categoria import Categoria
from saaacd.subserializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class CategoriaSerializador(DynamicFieldsModelSerializer):
    class Meta:
        model = Categoria
        fields = 'id', 'nombre','categoriaSuperior'
        depth = 2