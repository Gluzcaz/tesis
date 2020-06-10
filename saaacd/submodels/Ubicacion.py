from django.db import models
from django.db.models import Model 
from model_utils import Choices
from saaacd.submodels.RegionGeografica import RegionGeografica
from saaacd.submodels.TipoUbicacion import TipoUbicacion

class Ubicacion(Model):
    nombre = models.CharField(max_length=45)
    #Foreign Keys
    ubicacionSuperior = models.ForeignKey('self', related_name="superior", on_delete=models.CASCADE, null=True)
    regionGeografica = models.ForeignKey(RegionGeografica, on_delete=models.CASCADE, null=True)
    tipoUbicacion = models.ForeignKey(TipoUbicacion, on_delete=models.CASCADE)