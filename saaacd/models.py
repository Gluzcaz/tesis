from django.db import models
from saaacd.submodels.Ubicacion import Ubicacion
from model_utils import Choices

class Actividad(models.Model):
	SEMESTRE = Choices(
		('2020-1', '2020-1'),
		('2020-2', '2020-2'),
		('2020-1', '2021-1'),
		('2020-2', '2021-2'),
	)
	semestre = models.CharField(max_length=20, choices=SEMESTRE)
	nombre = models.CharField(max_length=150)
	comentario = models.CharField(max_length=250)
	fechaResolucion = models.DateField()
	esSiniestro = models.BooleanField(default=False)
	usuario = models.ForeignKey('auth.User', on_delete=models.CASCADE)
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
	#CARROS :  un fabricante hace varios coches
	#fabricante = models.ForeignKey(Fabricante)
	
	
	