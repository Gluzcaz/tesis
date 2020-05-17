from django.db import models
from django.db.models import Model 
from model_utils import Choices
from saaacd.submodels.Marca import Marca

class Modelo(Model):
	nombre = models.CharField(max_length=50)
	
	#Foreign Keys
	marca = models.ForeignKey(Marca, on_delete=models.CASCADE)



	
	