from django.db import models
from django.db.models import Model 
from saaacd.submodels.Modelo import Modelo

class FichaTecnica(Model):

	garantiaFabricante = models.IntegerField(blank=False, null=True)
	tiempoVida = models.IntegerField(blank=False, null=True)
	detalles = models.TextField(help_text='Redacta algún Comentario', null=True)
	existenciaInventario = models.IntegerField(blank=False, null=True, default=0)
	precio = models.DecimalField( 
                         max_digits = 10, 
                         decimal_places = 3, null=True) 
	#Foreign Keys
	modelo=models.ForeignKey(Modelo, on_delete=models.CASCADE)
	
	def __str__(self):
		return str(self.modelo)


	