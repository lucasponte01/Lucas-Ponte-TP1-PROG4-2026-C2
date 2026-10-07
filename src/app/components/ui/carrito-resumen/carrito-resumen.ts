import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: 'entrada' | 'candy' | 'combo';
  cantidad?: number;
}

@Component({
  imports: [],
  selector: 'app-carrito-resumen',
  styleUrl: './carrito-resumen.css',
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen {

  // Recibe la lista de elementos en el carrito
  @Input() items = signal<ItemCarrito[]>([]);
  
  // Evento para eliminar un ítem
  @Output() eliminarItem = new EventEmitter<string>();
  
  // Evento para confirmar la compra / avanzar al pago o generación de QR
  @Output() confirmarCompra = new EventEmitter<void>();

  // Cálculo automático del total a pagar
  get total(): number {
    return this.items().reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
  }

  quitar(id: string) {
    this.eliminarItem.emit(id);
  }

  finalizar() {
    this.confirmarCompra.emit();
  }
}
