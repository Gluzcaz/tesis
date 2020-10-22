from django.contrib import admin
from .models.Actividad import Actividad
from .models.Categoria import Categoria
from .models.Ubicacion import Ubicacion
from .models.Mapa import Mapa
from .models.Marca import Marca
from .models.Modelo import Modelo
from .models.Dispositivo import Dispositivo
from .models.FichaTecnica import FichaTecnica
from .models.Semestre import Semestre
from .models.RegionGeografica import RegionGeografica
from .models.TipoDispositivo import TipoDispositivo
from .models.TipoUbicacion import TipoUbicacion
from .models.HorarioClase import HorarioClase
from .models.Calendario import Calendario
from .models.InformacionEscolar import InformacionEscolar

# Header Admin Site
admin.site.site_header = 'SAAACD' # default: "Django Administration"
admin.site.index_title = 'Administración'                 # default: "Site administration"
admin.site.site_title = 'SAAACD' # default: "Django site admin"



# Register your models here.
@admin.register(Actividad)
class Actividad(admin.ModelAdmin):
 list_display = ('id', 'usuario', 'categoria', 'ubicacion', 'dispositivo',  'estado', 'prioridad', 'semestre', 'fechaAlta', 'fechaRequerido', 'fechaResolucion', 'esPeticion','actividadSuperior')
 list_filter = ('estado', 'prioridad')
 fields = ['usuario',('categoria', 'esPeticion', 'actividadSuperior'), 'ubicacion','dispositivo', ( 'fechaAlta', 'fechaRequerido'), ('estado', 'fechaResolucion'),  'prioridad', 'semestre']
 ordering = ['fechaAlta']
 search_fields = ['categoria__nombre']
 #autocomplete_fields = ['categoria']

@admin.register(Categoria)
class Categoria(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'categoriaSuperior')
 
@admin.register(Dispositivo)
class Dispositivo(admin.ModelAdmin):
 list_display = ('id', 'inventarioUNAM', 'tipoDispositivo', 'fichaTecnica', 'tiempoVida', 'ubicacion' , 'fechaAlta', 'fechaBaja', 'motivoBaja')
 list_filter = ['ubicacion__nombre']
 fields = ['inventarioUNAM', 'tipoDispositivo','fichaTecnica', 'ubicacion' , 'fechaAlta','fechaBaja', 'motivoBaja']
 ordering = ['fechaAlta']
 
@admin.register(FichaTecnica)
class FichaTecnica(admin.ModelAdmin):
 list_display = ('id', 'garantiaFabricante', 'detalles', 'precio', 'modelo', 'prediccionVidaUtil')

@admin.register(Mapa)
class Mapa(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'tipoUbicacion','imagen', 'esActivo')
 fields = [('nombre', 'esActivo'), 'tipoUbicacion', 'imagen']
 list_filter = ['tipoUbicacion__nombre']

@admin.register(Marca)
class Marca(admin.ModelAdmin):
 list_display = ('id', 'nombre')
 
@admin.register(Modelo)
class Modelo(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'marca')
 list_filter = ['marca__nombre']

@admin.register(RegionGeografica)
class RegionGeografica(admin.ModelAdmin):
 list_display = ('id', 'coordenada', 'centroide', 'mapa')
 list_filter = ['mapa__nombre']

@admin.register(Semestre)
class Semestre(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'esActivo', 'inicio', 'fin')
 
@admin.register(TipoDispositivo)
class TipoDispositivo(admin.ModelAdmin):
 list_display = ('id', 'nombre')
 
@admin.register(TipoUbicacion)
class TipoUbicacion(admin.ModelAdmin):
 list_display = ('id', 'nombre')
 
@admin.register(Ubicacion)
class Ubicacion(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'tipoUbicacion', 'ubicacionSuperior', 'regionGeografica')
 fields = ['nombre', 'tipoUbicacion', 'ubicacionSuperior', 'regionGeografica']
 
@admin.register(Calendario)
class Calendario(admin.ModelAdmin):
 list_display = ('id', 'diaHabil')
 fields = ['diaHabil']
 
@admin.register(InformacionEscolar)
class InformacionEscolar(admin.ModelAdmin):
 list_display = ('id', 'ubicacion', 'semestre', 'duracionSemestral', 'duracionMensual','numClasesSemanal')
 fields = ['ubicacion', 'semestre', 'duracionSemestral', 'duracionMensual','numClasesSemanal']
 
@admin.register(HorarioClase)
class HorarioClase(admin.ModelAdmin):
 list_display = ('id', 'diaSemana', 'horasClase', 'infoEscolar')
 fields = ['diaSemana', 'horasClase', 'infoEscolar']


 





