import { Component, computed, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { CandyServise } from '../../../services/candy/candy';
import CandyProducto, { CandyPorCrear } from '../../../interfaces/cady_productos';

@Component({
  imports: [NavbarComponent, CampoInput],
  selector: 'app-candy',
  styleUrl: './candy.css',
  templateUrl: './candy.html',
})
export class Candy {
  logo_menus = "/assets/imagenes/Gemini2.png"
  candy = inject(CandyServise);
  cargando = signal<boolean | null>(null)
  candy_muestra = signal<CandyProducto[]>([]);


   async ngOnInit() {
    this.cargando.set(true);
    try {
      
      await this.traerTodos_productos();
      
    } finally {
      this.cargando.set(false);
    }
  }


textoBusqueda = signal('');

CandyFiltrados = computed(() => {
  const texto = this.textoBusqueda().trim().toLowerCase();
  const resultado: CandyProducto[] = [];

  for (const producto of this.candy_muestra()) {
    if (!texto) {
      resultado.push(producto);
      continue;
    }

    let coincideCategoria = false;
    for (const categoria of producto.categorias) {
      if (categoria.toLowerCase().includes(texto)) {
        coincideCategoria = true;
        break;
      }
    }

    if (coincideCategoria) {
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
  }
}
