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

# Register your models here.
@admin.register(Actividad)
class Actividad(admin.ModelAdmin):
 list_display = ('id', 'estado', 'prioridad', 'fechaAlta', 'fechaRequerido', 'fechaResolucion', 'esSiniestro', 'categoria')
 list_filter = ('estado', 'prioridad')
#ordering = ['date_created']
#search_fields = ['question_text']
#autocomplete_fields = ['categoria']

@admin.register(Categoria)
class Categoria(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'categoriaSuperior')
 
@admin.register(Dispositivo)
class Dispositivo(admin.ModelAdmin):
 list_display = ('id', 'inventarioUNAM', 'fechaIngresoUbicacion', 'fechaAlta', 'fechaBaja', 'motivoBaja')
#ubicacion,fichaTecnica,tipoDispositivo

@admin.register(FichaTecnica)
class FichaTecnica(admin.ModelAdmin):
 list_display = ('id', 'garantiaFabricante', 'tiempoVida', 'detalles', 'existenciaInventario', 'precio')
#modelo

@admin.register(Mapa)
class Mapa(admin.ModelAdmin):
 list_display = ('id', 'nombre', 'imagen', 'esActivo')
#fields = ['nombre', 'tipoUbicacion',('imagen', 'esActivo')]
#tipoUbicacion

@admin.register(Marca)
class Marca(admin.ModelAdmin):
 list_display = ('id', 'nombre')
 
@admin.register(Modelo)
class Modelo(admin.ModelAdmin):
 list_display = ('id', 'nombre')
#marca

@admin.register(RegionGeografica)
class RegionGeografica(admin.ModelAdmin):
 list_display = ('id', 'coordenada', 'centroide')
#mapa

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
 list_display = ('id', 'nombre')
#ubicacionSuperior,regionGeografica,tipoUbicacion







