
import { Timestamp } from 'rxjs';

export interface Funcion {
  pelicula_id:string
  id: string;
  inicio: string;
  fin: string;
  fin_con_margen: string;
  formato: string;
  idioma: string;
  precio_base: string;
  precio_vip : string;
  es_preventa: boolean;
  created_at: Timestamp<any>;
  
  
}