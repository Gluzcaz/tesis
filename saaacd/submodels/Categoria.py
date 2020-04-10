from django.db import models
from django.db.models import Model 

class Categoria(Model):
	nombre = models.CharField(max_length=50)
	esSubcategoria = models.BooleanField(default=False)
	
	#Foreign Keys
	subcategoria = models.ForeignKey('self', on_delete=models.CASCADE)

	
	