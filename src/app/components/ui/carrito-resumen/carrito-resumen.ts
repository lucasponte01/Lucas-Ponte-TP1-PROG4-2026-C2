import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: 'entrada' | 'candy' | 'combo'; // <-- Agregamos 'entrada' aquí
  cantidad: number;
}

@Component({
  selector: 'app-carrito-resumen',
  standalone: true,
  imports: [],
  styleUrl: './carrito-resumen.css',
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen {
  @Input() items: ItemCarrito[] = [];
  @Output() eliminarItem = new EventEmitter<string>();
  @Output() confirmarCompra = new EventEmitter<void>();

  calcularTotal(): number {
    let suma = 0;
    for (const item of this.items) {
      suma += item.precio * item.cantidad;
    }
    return suma;
  }

  quitar(id: string) {
    this.eliminarItem.emit(id);
  }

  finalizar() {
    this.confirmarCompra.emit();
  }
}