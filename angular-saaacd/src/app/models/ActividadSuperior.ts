import { Usuario} from './Usuario';
import { Categoria} from './Categoria';
export interface ActividadSuperior {
  id: number;
  categoria: Categoria;
  usuario: Usuario;
}
