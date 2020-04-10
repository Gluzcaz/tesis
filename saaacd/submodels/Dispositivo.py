from django.db import models
from django.db.models import Model 
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.FichaTecnica import FichaTecnica
from model_utils import Choices

class Dispositivo(Model):
	TIPO_DISPOSITIVO = Choices(
		('p', ('Proyector')), 
		('l', ('Lampara')), 
		('t', ('Teclado'))
	)
	inventarioUNAM = models.CharField(max_length=50)
	fechaIngresoUbicacion = models.DateField()
	fechaBaja = models.DateField()
	fechaAlta = models.DateField()
	motivoBaja = models.TextField(help_text='Redacta algún Comentario')
	cantidadIdealInventario = models.IntegerField(blank=False, null=True)
	tipoDispositivo = models.CharField(max_length=20, choices=TIPO_DISPOSITIVO)
		
	#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
	fichaTecnica=models.ForeignKey(FichaTecnica, on_delete=models.CASCADE)

	
	