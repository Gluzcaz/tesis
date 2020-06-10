from rest_framework import serializers
from saaacd.subserializers.CategoriaSerializador import CategoriaSerializador
from saaacd.subserializers.SemestreSerializador import SemestreSerializador
from saaacd.subserializers.UbicacionSerializador import UbicacionSerializador
from saaacd.subserializers.UsuarioSerializador import UsuarioSerializador
from saaacd.subserializers.DispositivoSerializador import DispositivoSerializador
from saaacd.subserializers.ActividadSuperiorSerializador import ActividadSuperiorSerializador
from saaacd.models import Actividad

class ActividadSerializador(serializers.ModelSerializer):
    categoria = CategoriaSerializador(read_only=True) 
    semestre = SemestreSerializador(read_only=True) 
    ubicacion = UbicacionSerializador(read_only=True) 
    usuario = UsuarioSerializador(read_only=True) 
    dispositivo = DispositivoSerializador(read_only=True)
    actividadSuperior= ActividadSuperiorSerializador(read_only=True)
    class Meta:
        model = Actividad
        fields = ['id', 'estado','prioridad', 'comentario', 'fechaResolucion', 'fechaAlta', 'fechaRequerido', 'esSiniestro', 'actividadSuperior', 'categoria', 'semestre', 'ubicacion', 'usuario', 'dispositivo']

