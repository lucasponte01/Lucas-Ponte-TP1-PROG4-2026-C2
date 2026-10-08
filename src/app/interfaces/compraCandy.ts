export interface CompraItemCandy {
  id?: string;
  compra_id: string;
  producto_id: string;

  nombre_producto: string;

  cantidad: number;
  precio_unitario: number;
  subtotal: number;

  estado: 'pendiente' | 'entregado';
  fecha_entrega?: string | null;
}