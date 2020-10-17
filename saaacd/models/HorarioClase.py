from django.db import models
from django.db.models import Model 
from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.Semestre import Semestre

class HorarioClase(Model):
	duracionSemestral = models.IntegerField(null=False, default=0)
	duracionMensual = models.IntegerField(null=False, default=0) #4Semanas
	numClasesSemanal = models.IntegerField(null=False, default=0)
	Lunes = models.IntegerField(null=False, default=0)
	Martes = models.IntegerField(null=False, default=0)
	Miercoles = models.IntegerField(null=False, default=0)
	Jueves = models.IntegerField(null=False, default=0)
	Viernes = models.IntegerField(null=False, default=0)
	Sabado = models.IntegerField(null=False, default=0)
	Domingo = models.IntegerField(null=False, default=0)
	
	#Foreign Keys
	ubicacion=models.ForeignKey(Ubicacion, related_name="ubicacion_horario", on_delete=models.CASCADE, null=True)
	semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
	
	def __str__(self):
		return self.ubicacion + " - " + self.semestre
	