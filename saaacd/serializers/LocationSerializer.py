from saaacd.models.Ubicacion import Ubicacion
from saaacd.serializers.LocationTypeSerializer import LocationTypeSerializer
from saaacd.serializers.SuperiorLocationSerializer import SuperiorLocationSerializer
from saaacd.serializers.RegionSerializer import RegionSerializer
from saaacd.serializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class LocationSerializer(DynamicFieldsModelSerializer):
    tipoUbicacion = LocationTypeSerializer(read_only=True) 
    ubicacionSuperior = SuperiorLocationSerializer(read_only=True)
    regionGeografica = RegionSerializer(read_only=True)
    class Meta:
        model = Ubicacion
        fields = 'id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior', 'regionGeografica'
