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
  esSiniestro: boolean;
  actividadSuperior: ActividadSuperior;
  categoria: Categoria;
  semestre: Semestre;
  ubicacion: Ubicacion;
  usuario: Usuario;
  dispositivo: Dispositivo;
  public static PRIORITIES  = [ {id :'a', name:'Alta'}, {id:'m', name:'Media'}, {id:'b', name:'Baja'}];
  public static STATUSES = [ {id :'r', name:'Realizada'}, {id:'p', name:'Pendiente'}, {id:'e', name:'En Progreso'}];
}