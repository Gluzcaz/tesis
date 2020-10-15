from django.db import models
from saaacd.models.Ubicacion import Ubicacion
from saaacd.models.Categoria import Categoria
from saaacd.models.Semestre import Semestre
from saaacd.models.Dispositivo import Dispositivo
from model_utils import Choices
import datetime

class Actividad(models.Model):
    PENDIENTE = 1
    PROGRESO = 2
    REALIZADA = 3
    ESTADO = Choices(
		(PENDIENTE, ('Pendiente')), 
		(PROGRESO, ('En Progreso')), 
		(REALIZADA, ('Realizada'))
	)
	
    ALTA = 1
    MEDIA = 2
    BAJA = 3
    PRIORIDAD = Choices(
		(ALTA, ('Alta')), 
		(MEDIA, ('Media')), 
		(BAJA, ('Baja'))
	)
	
    MAX_LENGTH_COMMENT = 250;
	
    estado =  models.IntegerField(choices=ESTADO)
    prioridad =  models.IntegerField(choices=PRIORIDAD)
    comentario = models.CharField(max_length=250, null=True, blank = True)
    fechaResolucion = models.DateField(null=True, blank = True)
    fechaAlta = models.DateField(null=False, default=datetime.date.today)
    fechaRequerido = models.DateField(null=True,blank = True)
    esPeticion = models.BooleanField(default=False)
	#Foreign Keys
    usuario = models.ForeignKey('auth.User', related_name="usuario", on_delete=models.CASCADE, null=True)
    ubicacion=models.ForeignKey(Ubicacion, related_name="ubicacion", on_delete=models.CASCADE, null=True)
    categoria=models.ForeignKey(Categoria, related_name="categoria", on_delete=models.CASCADE)
    dispositivo=models.ForeignKey(Dispositivo, related_name="dispositivo", on_delete=models.CASCADE, null=True)
    actividadSuperior = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.id)
	
	