from django.db import models
from django.db.models import Model 

class TipoUbicacion(Model):
	nombre = models.CharField(max_length=50)

	def __str__(self):
		return self.nombre

	