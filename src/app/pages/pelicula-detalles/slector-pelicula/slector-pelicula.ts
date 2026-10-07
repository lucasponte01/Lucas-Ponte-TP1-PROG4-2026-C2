import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { MinAHsPipe } from '../../../components/ui/pipe/min-a-hs-pipe';

@Component({
  selector: 'app-slector-pelicula',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, MinAHsPipe], // <--- Importante para usar directivas y routing
  styleUrl: './slector-pelicula.css',
  templateUrl: './slector-pelicula.html',
})
export class SlectorPelicula implements OnInit {
  logo_menus = "/assets/imagenes/Gemini2.png"
  private route = inject(ActivatedRoute);
  private peliculaService = inject(PeliculaService);
  
  pelicula = signal<any>(null);
  funciones = signal<any[]>([]);
  Resenas = signal<any[]>([]);
  resenas_promedio = signal<number>(0);
  cargando = signal<boolean>(true);

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const peliculaId = params['peliculaId'];
      if (peliculaId) {
        await this.cargar_Datos_Detalle(peliculaId);
      }
    });
  }

  calcularPromedioEstrellas(): number {
    const listaResenas = this.Resenas();
    if (!listaResenas || listaResenas.length === 0) {
      this.resenas_promedio.set(0);
      return 0;
    }

    const suma = listaResenas.reduce((acc, r) => acc + Number(r.estrellas || 0), 0);
    const promedio = Number((suma / listaResenas.length).toFixed(1));

    this.resenas_promedio.set(promedio);
    return promedio;
  }

  async cargar_Datos_Detalle(id: string) {
  this.cargando.set(true);
  try {
    const respuesta = await this.peliculaService.mostrar_pelicula_id(id);
    this.pelicula.set(respuesta.pelicula ); 
    this.funciones.set(respuesta.funciones);
    this.Resenas.set(respuesta.resenas);
  
    this.calcularPromedioEstrellas();
  } catch (error) {
    console.error('Error al cargar detalles de la película:', error);
  } finally {
    this.cargando.set(false);
  }
}
}