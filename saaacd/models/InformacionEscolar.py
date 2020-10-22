from django.db import models
from django.db.models import Model 
from saaacd.models.Semestre import Semestre
from saaacd.models.Ubicacion import Ubicacion

class InformacionEscolar(Model):
	duracionSemestral = models.IntegerField(null=False, default=0)
	duracionMensual = models.IntegerField(null=False, default=0) #4Semanas
	numClasesSemanal = models.IntegerField(null=False, default=0)

#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, related_name="ubicacion_escolar", on_delete=models.CASCADE, null=False)
	semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE, null=False)

	def __str__(self):
		return self.ubicacion + " - " + self.semestre
	