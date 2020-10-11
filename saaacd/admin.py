from django.contrib import admin
from .models import Actividad
from .submodels.Categoria import Categoria
from .submodels.Ubicacion import Ubicacion
from .submodels.Mapa import Mapa
from .submodels.Marca import Marca
from .submodels.Modelo import Modelo
from .submodels.Dispositivo import Dispositivo
from .submodels.FichaTecnica import FichaTecnica
from .submodels.Semestre import Semestre
from .submodels.RegionGeografica import RegionGeografica
from .submodels.TipoDispositivo import TipoDispositivo
from .submodels.TipoUbicacion import TipoUbicacion

# Header Admin Site
admin.site.site_header = 'SAAACD' # default: "Django Administration"
admin.site.index_title = 'Administración'                 # default: "Site administration"
admin.site.site_title = 'SAAACD' # default: "Django site admin"



# Register your models here.
@admin.register(Actividad)
class Actividad(admin.ModelAdmin):
 list_display = ('id', 'usuario', 'categoria', 'ubicacion', 'dispositivo',  'estado', 'prioridad', 'semestre', 'fechaAlta', 'fechaRequerido', 'fechaResolucion', 'esSiniestro','actividadSuperior')
 list_filter = ('estado', 'prioridad')
 fields = ['usuario',('categoria', 'esSiniestro', 'actividadSuperior'), 'ubicacion','dispositivo', ( 'fechaAlta', 'fechaRequerido'), ('estado', 'fechaResolucion'),  'prioridad', 'semestre']
 ordering = ['fechaAlta']
 search_fields = ['categoria__nombre']
 #autocomplete_fields = ['categoria']

@admin.register(Categoria)
class Categoria(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'categoriaSuperior')
 
@admin.register(Dispositivo)
class Dispositivo(admin.ModelAdmin):
 list_display = ('id', 'inventarioUNAM', 'tipoDispositivo', 'fichaTecnica', 'ubicacion' , 'fechaAlta', 'fechaBaja', 'motivoBaja')
 list_filter = ['ubicacion__nombre']
 fields = ['inventarioUNAM', 'tipoDispositivo','fichaTecnica', 'ubicacion' , 'fechaAlta','fechaBaja', 'motivoBaja']
 ordering = ['fechaAlta']
 
@admin.register(FichaTecnica)
class FichaTecnica(admin.ModelAdmin):
 list_display = ('id', 'garantiaFabricante', 'tiempoVida', 'detalles', 'existenciaInventario', 'precio', 'modelo')

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
 list_display = ('id', 'nombre', 'esActivo')
 
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





