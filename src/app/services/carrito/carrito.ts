import { Injectable, signal } from '@angular/core';

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: 'entrada' | 'candy' | 'combo'; 
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  
  public items = signal<ItemCarrito[]>([]);


  agregarItem(item: ItemCarrito) {
    const actual = this.items();
    const itemExistente = actual.find(i => i.id === item.id);

    if (itemExistente) {
      const nuevoArray = actual.map(i => {
        if (i.id === item.id) {
          return Object.assign({}, i, { cantidad: i.cantidad + item.cantidad });
        }
        return i;
      });
      this.items.set(nuevoArray);
    } else {
      
      this.items.set(actual.concat([item]));
    }
  }

  removerItem(id: string) {
    const actual = this.items();
    const filtrado = actual.filter(i => i.id !== id);
    this.items.set(filtrado);
  }

  limpiarCarrito() {
    this.items.set([]);
  }

  calcularTotal(): number {
    let suma = 0;
    const actual = this.items();
    for (const item of actual) {
      suma += item.precio * item.cantidad;
    }
    return suma;
  }
}