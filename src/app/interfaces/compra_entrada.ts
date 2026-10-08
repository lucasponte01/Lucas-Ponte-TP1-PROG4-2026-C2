export interface CompraEntrada {
  id?: string;
  compra_id: string;
  funcion_id: string;
  butaca_id: string;

  precio: number;

  estado: 'pendiente' | 'validada';
  fecha_validacion?: string | null;
}