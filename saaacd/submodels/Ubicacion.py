from django.db import models
from django.db.models import Model 
from model_utils import Choices
from saaacd.submodels.RegionGeografica import RegionGeografica

class Ubicacion(Model):
	TIPO_UBICACION = Choices(
		('s', ('Salon')), 
		('e', ('Edificio')), 
		('q', ('Equipo'))
	)
	tipoUbicacion = models.CharField(choices=TIPO_UBICACION, default=TIPO_UBICACION.s, max_length=20)	
	nombre = models.CharField(max_length=45)
	#Foreign Keys
	ubicacionSuperior = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
	regionGeografica = models.ForeignKey(RegionGeografica, on_delete=models.CASCADE)

	
	