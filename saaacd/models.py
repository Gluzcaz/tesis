from django.db import models
#from .models import Author, Genre, Book, BookInstance
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.Categoria import Categoria
from saaacd.submodels.Dispositivo import Dispositivo
from model_utils import Choices

class Actividad(models.Model):
	SEMESTRE = Choices(
		('2019-1', '2019-1'),
		('2020-1', '2020-1'),
		('2020-2', '2020-2'),
		('2020-1', '2021-1'),
		('2020-2', '2021-2'),
	)
	
	ESTADO = Choices(
		('r', ('Realizada')), 
		('p', ('Pendiente')), 
		('ep', ('En Progreso'))
	)
	
	PRIORIDAD = Choices(
		('a', ('Alta')), 
		('m', ('Media')), 
		('b', ('Baja'))
	)
	
	semestre = models.CharField(max_length=20, choices=SEMESTRE)
	estado = models.CharField(max_length=20, choices=ESTADO)
	prioridad = models.CharField(max_length=20, choices=PRIORIDAD)
	nombre = models.CharField(max_length=150)
	comentario = models.CharField(max_length=250)
	fechaResolucion = models.DateField()
	esSiniestro = models.BooleanField(default=False)
	#Foreign Keys
	usuario = models.ForeignKey('auth.User', on_delete=models.CASCADE)
	ubicacion=models.ForeignKey(Ubicacion, on_delete=models.CASCADE)
	categoria=models.ForeignKey(Categoria, on_delete=models.CASCADE)
	dispositivo=models.ForeignKey(Dispositivo, on_delete=models.CASCADE)
	subactividad = models.ForeignKey('self', on_delete=models.CASCADE)
	
	
	