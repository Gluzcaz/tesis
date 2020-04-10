from django.db import models
from django.db.models import Model 
from model_utils import Choices

class Modelo(Model):
	MARCA = Choices(
		('e', ('EPSON')), 
		('d', ('DELL')), 
		('h', ('HP'))
	)
	
	nombre = models.CharField(max_length=50)
	marca = models.CharField(max_length=20, choices=MARCA)


	
	