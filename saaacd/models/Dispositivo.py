from django.db import models
from django.db.models import Model 
from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.FichaTecnica import FichaTecnica
from saaacd.models.TipoDispositivo import TipoDispositivo
import datetime

class Dispositivo(models.Model):
	tiempoVida = models.IntegerField(blank=False, null=False, default=0, help_text='Tiempo de vida en horas.')	#Horas
	inventarioUNAM = models.CharField(max_length=50)
	fechaBaja = models.DateField(null=True)
	fechaAlta = models.DateField(null=True, default=datetime.date.today)
	motivoBaja = models.TextField(help_text='Redacta algún Comentario', null=True)
			
	#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE, null=True)
	fichaTecnica=models.ForeignKey(FichaTecnica, on_delete=models.CASCADE)
	tipoDispositivo=models.ForeignKey(TipoDispositivo, on_delete=models.CASCADE)
	
	def __str__(self):
		return self.inventarioUNAM + " " + str(self.tipoDispositivo) + " " + str(self.fichaTecnica)
		
	class Meta:
		default_permissions = ('add', 'delete', 'change', 'view')


	
	