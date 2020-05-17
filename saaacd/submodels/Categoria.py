from django.db import models
from django.db.models import Model 

class Categoria(Model):
	nombre = models.CharField(max_length=1000)
	
	#Foreign Keys
	categoriaSuperior = models.ForeignKey('self', on_delete=models.CASCADE, null=True)

	
	