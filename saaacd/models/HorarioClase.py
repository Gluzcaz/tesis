from django.db import models
from django.db.models import Model 
from saaacd.models.InformacionEscolar import InformacionEscolar
from model_utils import Choices

class HorarioClase(Model):
	#DOMINGO = 1
	LUNES = 2
	MARTES = 3
	MIERCOLES = 4
	JUEVES = 5
	VIERNES = 6
	SABADO = 7
	DIA_SEMANA = Choices(
		#(DOMINGO, ('Domingo')), 
		(LUNES, ('Lunes')), 
		(MARTES, ('Martes')),
		(MIERCOLES, ('Miércoles')),
		(JUEVES, ('Jueves')),
		(VIERNES, ('Viernes')),
		(SABADO, ('Sábado'))
	)
	horasClase = models.IntegerField(null=False, default=0)

	#Foreign Keys	
	diaSemana = models.IntegerField(choices=DIA_SEMANA, null=False)
	infoEscolar = models.ForeignKey(InformacionEscolar, on_delete=models.CASCADE, null=False)
	
	def __str__(self):
		return self.diaSemana + " - " + self.horasClase + "hrs"
