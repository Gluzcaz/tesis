from django.contrib import admin
from .models import Actividad
from .submodels.Categoria import Categoria
from .submodels.Ubicacion import Ubicacion
from .submodels.Mapa import Mapa
from .submodels.Dispositivo import Dispositivo
from .submodels.FichaTecnica import FichaTecnica
from .submodels.Modelo import Modelo
from .submodels.RegionGeografica import RegionGeografica

# Register your models here.
admin.site.register(Actividad)
admin.site.register(Categoria)
admin.site.register(Ubicacion)
admin.site.register(Mapa)
admin.site.register(Dispositivo)
admin.site.register(FichaTecnica)
admin.site.register(Modelo)
admin.site.register(RegionGeografica)