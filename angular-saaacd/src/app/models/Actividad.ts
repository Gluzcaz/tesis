import { Ubicacion} from './Ubicacion';
import { Categoria} from './Categoria';
import { Semestre} from './Semestre';
import { Usuario} from './Usuario';
import { Dispositivo} from './Dispositivo';
import { ActividadSuperior} from './ActividadSuperior';
export class Actividad {
  id: number;
  estado: string;
  prioridad: string;
  comentario: string;
  fechaResolucion: string;
  fechaAlta: string;
  fechaRequerido: string;
  esPeticion: boolean;
  actividadSuperior: ActividadSuperior;
  categoria: Categoria;
  semestre: Semestre;
  ubicacion: Ubicacion;
  usuario: Usuario;
  dispositivo: Dispositivo;
  public static PRIORITIES  = [ {id :1, name:'Alta'}, {id:2, name:'Media'}, {id:3, name:'Baja'}];
  public static STATUSES = [ {id :1, name:'Pendiente'}, {id:2, name:'En Progreso'}, {id:3, name:'Realizada'}];
  public static MAX_LENGTH_COMMENT : number = 250;
}