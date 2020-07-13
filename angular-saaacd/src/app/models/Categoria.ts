import { CategoriaSuperior} from './CategoriaSuperior';
export interface Categoria {
  id: number;
  nombre: string;
  categoriaSuperior: CategoriaSuperior;
}
