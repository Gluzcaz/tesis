from rest_framework import serializers
from saaacd.subserializers.CategoriaSerializador import CategoriaSerializador
from saaacd.subserializers.SemestreSerializador import SemestreSerializador
from saaacd.subserializers.UbicacionSerializador import UbicacionSerializador
from saaacd.subserializers.UsuarioSerializador import UsuarioSerializador
from saaacd.subserializers.DispositivoSerializador import DispositivoSerializador
from saaacd.subserializers.ActividadSuperiorSerializador import ActividadSuperiorSerializador
from saaacd.models import Actividad
from saaacd.subserializers.DynamicFieldsModelSerializer import DynamicFieldsModelSerializer

class ActividadSerializador(DynamicFieldsModelSerializer):
    categoria = CategoriaSerializador(read_only=True, fields=('id', 'nombre', 'categoriaSuperior')) 
    semestre = SemestreSerializador(read_only=True) 
    ubicacion = UbicacionSerializador(read_only=True, fields=('id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior')) 
    usuario = UsuarioSerializador(read_only=True) 
    dispositivo = DispositivoSerializador(read_only=True)
    actividadSuperior= ActividadSuperiorSerializador(read_only=True)
    class Meta:
        model = Actividad
        fields = 'id', 'estado','prioridad', 'comentario', 'fechaResolucion', 'fechaAlta', 'fechaRequerido', 'esSiniestro', 'actividadSuperior', 'categoria', 'semestre', 'ubicacion', 'usuario', 'dispositivo'
		
    def validate(self, attrs):
        """
        Check that the start is before the stop.
        """
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
        if(attrs['estado']== Actividad.ESTADO.r and attrs['fechaResolucion'] is None):
            raise serializers.ValidationError("Thne state Done needs a resolution date to be registered.")
        
        """if(attrs['usuario'] is None):
            raise serializers.ValidationError("User is required.")
        if(attrs['categoria'] is None):
            raise serializers.ValidationError("Category is required.")
        if(attrs['semestre'] is None):
            raise serializers.ValidationError("Semester is required.")"""
        return attrs
