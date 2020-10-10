from django.db import models
from django.db.models import Model 

class Categoria(Model):
	nombre = models.CharField(max_length=1000)
	
	#Foreign Keys
	categoriaSuperior = models.ForeignKey('self', related_name='superior', on_delete=models.CASCADE, null=True)

	def __str__(self):
		esCategoriaSuperior = ""
		if self.categoriaSuperior == None:
			esCategoriaSuperior = " - SUPERIOR" 
		return str(self.id) + " " + self.nombre + esCategoriaSuperior
	
	