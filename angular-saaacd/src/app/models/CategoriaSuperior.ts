import {CategoriaSuperSuperior} from './CategoriaSuperSuperior';
export interface CategoriaSuperior {
  id: number;
  nombre: string;
  categoriaSuperior: CategoriaSuperSuperior;
}
