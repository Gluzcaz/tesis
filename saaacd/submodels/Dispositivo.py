from django.db import models
from django.db.models import Model 
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.FichaTecnica import FichaTecnica
from saaacd.submodels.TipoDispositivo import TipoDispositivo

class Dispositivo(Model):

	inventarioUNAM = models.CharField(max_length=50)
	fechaIngresoUbicacion = models.DateField()
	fechaBaja = models.DateField()
	fechaAlta = models.DateField()
	motivoBaja = models.TextField(help_text='Redacta algún Comentario')
	cantidadIdealInventario = models.IntegerField(blank=False, null=True)
			
	#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
	fichaTecnica=models.ForeignKey(FichaTecnica, on_delete=models.CASCADE)
	tipoDispositivo=models.ForeignKey(TipoDispositivo, on_delete=models.CASCADE)


	
	