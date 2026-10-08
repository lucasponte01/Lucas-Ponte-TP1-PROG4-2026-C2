export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: 'entrada' | 'candy' | 'combo'; // <-- Agregamos 'entrada' aquí
  cantidad: number;
}