
import { Timestamp } from 'rxjs';

export interface Funcion {
  id: string;
  pelicula_id:string
  sala_id: string;
  inicio: string;
  fin: string;
  formato: string;
  idioma: string;
  precio_base: number;
  precio_vip : number;
  es_preventa: boolean;
  created_at: Timestamp<any>;
  
}

export interface FuncionPorCrear{
  pelicula_id:string
  sala_id: string,
  inicio: string;
  fin: string;
  formato: string;
  idioma: string;
  precio_base: number;
  precio_vip : number;
  es_preventa: boolean;
}

export interface FuncionPorModificar{
  id: string;
  pelicula_id:string
  sala_id: string,
  inicio: string;
  fin: string;
  formato: string;
  idioma: string;
  precio_base: number;
  precio_vip : number;
  es_preventa: boolean;
}