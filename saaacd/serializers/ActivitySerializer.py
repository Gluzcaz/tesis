from rest_framework import serializers
from saaacd.serializers.CategorySerializer import CategorySerializer
from saaacd.serializers.SemesterSerializer import SemesterSerializer
from saaacd.serializers.LocationSerializer import LocationSerializer
from saaacd.serializers.UserSerializer import UserSerializer
from saaacd.serializers.DeviceSerializer import DeviceSerializer
from saaacd.serializers.SuperiorActivitySerializer import SuperiorActivitySerializer
from saaacd.models.Actividad import Actividad
from saaacd.serializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class ActivitySerializer(DynamicFieldsModelSerializer):
    categoria = CategorySerializer(read_only=True, fields=('id', 'nombre', 'categoriaSuperior')) 
    semestre = SemesterSerializer(read_only=True) 
    ubicacion = LocationSerializer(read_only=True, fields=('id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior')) 
    usuario = UserSerializer(read_only=True) 
    dispositivo = DeviceSerializer(read_only=True)
    actividadSuperior= SuperiorActivitySerializer(read_only=True)
    class Meta:
        model = Actividad
        fields = 'id', 'estado','prioridad', 'comentario', 'fechaResolucion', 'fechaAlta', 'fechaRequerido', 'esPeticion', 'actividadSuperior', 'categoria', 'semestre', 'ubicacion', 'usuario', 'dispositivo'
		
    def validate(self, attrs):
        if(attrs['fechaAlta'] is None):
            raise serializers.ValidationError("Start date is required.")
        if(attrs['estado'] is None):
            raise serializers.ValidationError("Status is required.")
        if(attrs['prioridad'] is None):
            raise serializers.ValidationError("Priority is required.")
        if(len(attrs['comentario']) > Actividad.MAX_LENGTH_COMMENT):
            raise serializers.ValidationError("Comment exceeds the maximum lenght string.")
        if(attrs['fechaRequerido'] is not None):
            if(attrs['fechaAlta'] > attrs['fechaRequerido']):
                raise serializers.ValidationError("Required Date must occur after start Date.")
        if(attrs['fechaResolucion'] is not None):
            if(attrs['fechaAlta'] >= attrs['fechaResolucion']):
                raise serializers.ValidationError("Resolution Date must occur after start Date.")
        if((attrs['estado']== Actividad.REALIZADA or attrs['estado'] == Actividad.CANCELADA) and attrs['fechaResolucion'] is None):
            raise serializers.ValidationError("The state Done and Interrumpted needs a resolution date to be registered.")
        
        """if(attrs['usuario'] is None):
            raise serializers.ValidationError("User is required.")
        if(attrs['categoria'] is None):
            raise serializers.ValidationError("Category is required.")
        if(attrs['semestre'] is None):
            raise serializers.ValidationError("Semester is required.")"""
        return attrs
