from django.db import models
from django.db.models import Model 

class Semestre(Model):
	nombre = models.CharField(max_length=50)
	
	
	