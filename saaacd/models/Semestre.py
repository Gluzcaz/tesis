from django.db import models
from django.db.models import Model 

class Semestre(Model):
	nombre = models.CharField(max_length=50)
	esActivo = models.BooleanField(default=0)
	inicio = models.DateField(null=False)
	fin = models.DateField(null=False)
	diasAsueto = models.IntegerField(null=False)
	
	def __str__(self):
		return self.nombre
	