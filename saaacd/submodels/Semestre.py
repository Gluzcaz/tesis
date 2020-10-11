from django.db import models
from django.db.models import Model 

class Semestre(Model):
	nombre = models.CharField(max_length=50)
	esActivo = models.BooleanField(default=False)
	
	def __str__(self):
		return self.nombre
	