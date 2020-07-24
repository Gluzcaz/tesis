import { TipoUbicacion} from './TipoUbicacion';
import { UbicacionSuperior} from './UbicacionSuperior';
export class Ubicacion {
  id: number;
  nombre: string;
  tipoUbicacion: TipoUbicacion; 
  ubicacionSuperior: UbicacionSuperior;
}
