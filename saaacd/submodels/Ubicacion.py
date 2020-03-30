from django.db import models
from model_utils import Choices

class Ubicacion(models.Model):
	TIPO_UBICACION = Choices(
		('s', ('Salon')), 
		('e', ('Edificio')), 
		('eq', ('Equipo'))
	)
	tipoUbicacion = models.CharField(choices=TIPO_UBICACION, default=TIPO_UBICACION.s, max_length=20)	
	nombre = models.CharField(max_length=45)
	esContenedor = models.BooleanField(default=False)
	#regionGeografica
	#Ubicacion
	
	