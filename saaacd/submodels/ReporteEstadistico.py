from django.db import models
from django.db.models import Model 

class ReporteEstadistico(Model):
    data = models.CharField(max_length=1000)
    centroide = centroide = models.CharField(max_length=100)
    nombre = models.CharField(max_length=45)
