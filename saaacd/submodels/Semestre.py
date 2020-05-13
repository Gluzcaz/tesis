from django.db import models
from django.db.models import Model 

class Semestre(Model):
	nombre = models.CharField(max_length=20)
	
	#Foreign Keys
	categoriaSuperior = models.ForeignKey('self', on_delete=models.CASCADE)

	
	