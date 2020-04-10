from django.db import models
from django.db.models import Model 
from model_utils import Choices
from saaacd.submodels.RegionGeografica import RegionGeografica

class Ubicacion(Model):
	TIPO_UBICACION = Choices(
		('s', ('Salon')), 
		('e', ('Edificio')), 
		('eq', ('Equipo'))
	)
	tipoUbicacion = models.CharField(choices=TIPO_UBICACION, default=TIPO_UBICACION.s, max_length=20)	
	nombre = models.CharField(max_length=45)
	esContenedor = models.BooleanField(default=False)
	#Foreign Keys
	ubicacionInterior = models.ForeignKey('self', on_delete=models.CASCADE)
	regionGeografica = models.ForeignKey(RegionGeografica, on_delete=models.CASCADE)

	
	