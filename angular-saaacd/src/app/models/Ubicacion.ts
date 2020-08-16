import { TipoUbicacion} from './TipoUbicacion';
import { UbicacionSuperior} from './UbicacionSuperior';
import { RegionGeografica} from './RegionGeografica';
export class Ubicacion {
  id: number;
  nombre: string;
  tipoUbicacion: TipoUbicacion; 
  ubicacionSuperior: UbicacionSuperior;
  regionGeografica: RegionGeografica;
}
