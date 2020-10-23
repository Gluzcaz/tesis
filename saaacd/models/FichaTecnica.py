from django.db import models
from django.db.models import Model 
from saaacd.models.Modelo import Modelo

class FichaTecnica(Model):
	garantiaFabricante = models.IntegerField(blank=False, null=True, help_text='Guardada en años.')
	detalles = models.TextField(help_text='Redacta algún Comentario', null=True)
	precio = models.DecimalField( 
                         max_digits = 10, 
                         decimal_places = 3, null=False, default=0) 
	#Foreign Keys
	modelo=models.ForeignKey(Modelo, on_delete=models.CASCADE)
	
	def __str__(self):
		return str(self.modelo)


	