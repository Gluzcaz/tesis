from django.db import models
from django.db.models import Model 
from saaacd.submodels.Modelo import Modelo

class FichaTecnica(Model):

	garantiaFabricante = models.IntegerField(blank=False, null=True)
	tiempoVida = models.IntegerField(blank=False, null=True)
	detalles = models.TextField(help_text='Redacta algún Comentario')
	existenciaInventario = models.IntegerField(blank=False, null=True)
	precio = models.DecimalField( 
                         max_digits = 5, 
                         decimal_places = 3) 
	#Foreign Keys
	modelo=models.ForeignKey(Modelo, on_delete=models.CASCADE)

	