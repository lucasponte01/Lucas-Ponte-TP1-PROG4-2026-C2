import { Component, computed, inject, signal } from '@angular/core';
import CandyProducto from '../../../interfaces/cady_productos';
import { CandyServise } from '../../../services/candy/candy';
import { ComboServise } from '../../../services/combo/combos';
import ComboProducto from '../../../interfaces/combos';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { ItemCarrito, CarritoResumen } from '../../../components/ui/carrito-resumen/carrito-resumen';
import { ResaltarComboDirective } from '../../../directives/resaltar-combo';
import { CarritoService } from '../../../services/carrito/carrito';

@Component({
  selector: 'app-candy',
  standalone: true,
  imports: [NavbarComponent, CampoInput , ResaltarComboDirective, CarritoResumen],
  styleUrl: './candy.css',
  templateUrl: './candy.html',
})
export class Candy {
  logo_menus = "/assets/imagenes/Gemini2.png";
  candy = inject(CandyServise);
  combo = inject(ComboServise);
  
  cargando = signal<boolean | null>(null);
  candy_muestra = signal<CandyProducto[]>([]);
  combo_muestra = signal<ComboProducto[]>([]);
  
 
  public carritoService = inject(CarritoService);

  textoBusqueda = signal('');

  async ngOnInit() {
    this.cargando.set(true);
    try {
      await this.traerTodos_productos();
      
    } finally {
      this.cargando.set(false);
    }
  }


  CandyFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const resultado: CandyProducto[] = [];

    for (const producto of this.candy_muestra()) {
      if (!texto) {
        resultado.push(producto);
        continue;
      }

      let coincide = producto.nombre.toLowerCase().includes(texto);
      if (!coincide && producto.categorias) {
        for (const categoria of producto.categorias) {
          if (categoria.toLowerCase().includes(texto)) {
            coincide = true;
            break;
          }
        }
      }

      if (coincide) {
        resultado.push(producto);
      }
    }
    return resultado;
  });


  onBuscar(texto: string): void {
    this.textoBusqueda.set(texto);
  }

  async traerTodos_productos() {
    this.candy_muestra.set(await this.candy.mostrar_productos());
    this.combo_muestra.set(await this.combo.obtenerCombos());
  }

  // Métodos del Carrito
    agregar(id: string, nombre: string, precio: number, tipo: 'candy' | 'combo') {
    this.carritoService.agregarItem({
      id: id,
      nombre: nombre,
      precio: precio,
      tipo: tipo,
      cantidad: 1
    });
  }

  procesarPagoYGenerarQR() {
    
    // Aquí integras la lógica final para registrar el pedido y generar el QR de retiro
    alert('¡Compra de Candy y Combos realizada con éxito! Generando QR...');
  }
}