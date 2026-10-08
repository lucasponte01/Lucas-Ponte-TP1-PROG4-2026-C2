export interface Compra {
  id?: string;
  usuario_id?: string | null;
  pelicula_id?: string | null;
  funcion_id?: string | null;
  sala_id?: string | null;

  subtotal_entradas: number;
  subtotal_candy: number;
  total: number;

  total_pagado_dinero: number;
  total_pagado_puntos: number;

  estado_pago: 'pendiente' | 'pagado' | 'cancelado';

  fecha_compra?: string;
  qr_codigo?: string;
}