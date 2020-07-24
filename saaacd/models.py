from django.db import models
#from .models import Author, Genre, Book, BookInstance
from saaacd.submodels.Ubicacion import Ubicacion
from saaacd.submodels.Categoria import Categoria
from saaacd.submodels.Semestre import Semestre
from saaacd.submodels.Dispositivo import Dispositivo
from model_utils import Choices

class Actividad(models.Model):
    ESTADO = Choices(
		('r', ('Realizada')), 
		('p', ('Pendiente')), 
		('e', ('En Progreso'))
	)
	
    PRIORIDAD = Choices(
		('a', ('Alta')), 
		('m', ('Media')), 
		('b', ('Baja'))
	)
	
    MAX_LENGTH_COMMENT = 250;
	
    estado = models.CharField(max_length=20, choices=ESTADO)
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD)
    comentario = models.CharField(max_length=250, null=True, blank = True)
    fechaResolucion = models.DateField(null=True, blank = True)
    fechaAlta = models.DateField()
    fechaRequerido = models.DateField(null=True,blank = True)
    esSiniestro = models.BooleanField(default=False)
	#Foreign Keys
    usuario = models.ForeignKey('auth.User', related_name="usuario", on_delete=models.CASCADE, null=True)
    ubicacion=models.ForeignKey(Ubicacion, related_name="ubicacion", on_delete=models.CASCADE, null=True)
    categoria=models.ForeignKey(Categoria, related_name="categoria", on_delete=models.CASCADE)
    dispositivo=models.ForeignKey(Dispositivo, related_name="dispositivo", on_delete=models.CASCADE, null=True)
    actividadSuperior = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)

    def __str__(self):
        return ""
	
	