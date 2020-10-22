from django.db import models
from django.db.models import Model 
from model_utils import Choices
from saaacd.models.RegionGeografica import RegionGeografica
from saaacd.models.TipoUbicacion import TipoUbicacion

class Ubicacion(Model):
	nombre = models.CharField(max_length=45)
	altitud = models.IntegerField(null=False, default=0, help_text="Altitud de CU es 2268m y por piso se suman 3m.") 
	exposicionSol = models.IntegerField(null=False, default=0, help_text="Tiempo en horas al día de exposición directa al sol.") 

	#Foreign Keys
	ubicacionSuperior = models.ForeignKey('self', related_name="superior", on_delete=models.CASCADE, null=True)
	regionGeografica = models.ForeignKey(RegionGeografica, on_delete=models.CASCADE, null=True)
	tipoUbicacion = models.ForeignKey(TipoUbicacion, on_delete=models.CASCADE)
	
	def __str__(self):
		esUbicacionSuperior = ""
		if self.ubicacionSuperior == None:
			esUbicacionSuperior = " - SUPERIOR" 
		return self.nombre + " " + esUbicacionSuperior