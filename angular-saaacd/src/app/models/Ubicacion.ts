import { TipoUbicacion} from './TipoUbicacion';
import { UbicacionSuperior} from './UbicacionSuperior';
export interface Ubicacion {
  id: number;
  nombre: string;
  tipoUbicacion: TipoUbicacion; 
  ubicacionSuperior: UbicacionSuperior;
}
