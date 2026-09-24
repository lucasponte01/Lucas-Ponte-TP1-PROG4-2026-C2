import { Timestamp } from 'rxjs';

export interface Pelicula {
  id: string;
  nombre: string;
  sinopsis: string;
  imagen_url: string;
  duracion_min: number;
  restriccion_edad: number | null;
  fecha_estreno: string;
  preventa_pct_descuento : number;
  created_at: Timestamp<any>;
  generos: [];
  
}