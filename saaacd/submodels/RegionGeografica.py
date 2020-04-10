from django.db import models
from django.db.models import Model 
from saaacd.submodels.Mapa import Mapa

class RegionGeografica(Model):
	coordenada = models.CharField(max_length=1000)
	centroide = models.CharField(max_length=50)
	#Foreign Keys
	mapa=models.ForeignKey(Mapa, on_delete=models.CASCADE)
	
	