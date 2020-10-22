from django.db import models
from django.db.models import Model 
from saaacd.models.Semestre import Semestre
from saaacd.models.HorarioClase import HorarioClase

class Calendario(Model):
	diaHabil = models.DateField(null=False)
	#diaSemana = models.IntegerField(choices = HorarioClase.DIA_SEMANA)
	
    #Foreign Keys
	semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE,)
	
	def __str__(self):
		return self.diaHabil
	