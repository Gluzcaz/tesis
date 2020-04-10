from django.db import models
from django.db.models import Model 

class Mapa(Model):
	#Dato imagen, se almacenarán en la carpeta recetas, titulo: Imagen
	imagen = models.ImageField(upload_to='mapas', verbose_name='Imagen')
	nombre = models.CharField(max_length=50)

	
	