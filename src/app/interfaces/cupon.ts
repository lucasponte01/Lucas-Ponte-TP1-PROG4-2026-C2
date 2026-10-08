export interface Cupon {
  id: string;
  codigo: string;
  tipo: string;
  valor: number;
  edad_minima: number | null;
  solo_primera_compra: boolean;
  activo: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface CuponPorCrear {
  codigo: string;
  tipo: string;
  valor: number;
  edad_minima: number | null;
  solo_primera_compra: boolean;
  activo: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}