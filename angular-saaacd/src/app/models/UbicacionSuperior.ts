import { TipoUbicacion} from './TipoUbicacion';
export interface UbicacionSuperior {
  id: number;
  nombre: string;
  tipoUbicacion: TipoUbicacion; 
}
