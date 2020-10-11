from django.db import models
from django.db.models import Model 
from saaacd.submodels.Mapa import Mapa

class RegionGeografica(Model):
	coordenada = models.CharField(max_length=2000)
	centroide = models.CharField(max_length=100)
	#Foreign Keys
	mapa=models.ForeignKey(Mapa, on_delete=models.CASCADE)
	
	def __str__(self):
		return str(self.id)

	
	