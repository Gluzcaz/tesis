from django.db import models
from django.db.models import Model 

class Marca(Model):
	nombre = models.CharField(max_length=50)
	

	
	