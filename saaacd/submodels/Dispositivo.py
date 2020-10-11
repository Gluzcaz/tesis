from django.db import models
from django.db.models import Model 
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.FichaTecnica import FichaTecnica
from saaacd.submodels.TipoDispositivo import TipoDispositivo

class Dispositivo(models.Model):

	inventarioUNAM = models.CharField(max_length=50)
	fechaIngresoUbicacion = models.DateField(null=True)
	fechaBaja = models.DateField(null=True)
	fechaAlta = models.DateField(null=True)
	motivoBaja = models.TextField(help_text='Redacta algún Comentario', null=True)
			
	#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE, null=True)
	fichaTecnica=models.ForeignKey(FichaTecnica, on_delete=models.CASCADE)
	tipoDispositivo=models.ForeignKey(TipoDispositivo, on_delete=models.CASCADE)

	def __str__(self):
		return self.inventarioUNAM + " " + str(self.tipoDispositivo) + " " + str(self.fichaTecnica)


	
	