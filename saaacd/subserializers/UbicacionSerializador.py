from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.subserializers.TipoUbicacionSerializador import TipoUbicacionSerializador
from saaacd.subserializers.UbicacionSuperiorSerializador import UbicacionSuperiorSerializador
from saaacd.subserializers.RegionSerializador import RegionSerializador
from saaacd.subserializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class UbicacionSerializador(DynamicFieldsModelSerializer):
    tipoUbicacion = TipoUbicacionSerializador(read_only=True) 
    ubicacionSuperior = UbicacionSuperiorSerializador(read_only=True)
    regionGeografica = RegionSerializador(read_only=True)
    class Meta:
        model = Ubicacion
        fields = 'id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior', 'regionGeografica'
