import { Component, computed, inject, Pipe, Signal, signal } from '@angular/core';
import { NavbarComponent } from '../../components/ui/navbar/navbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuncionService } from '../../services/funciones/funciones';
import { pipe } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PeliculaService } from '../../services/peliculas/peliculas';
import Pelicula from '../../interfaces/peliculas';
import { Funcion } from '../../interfaces/funcion';
import Resenas from '../../interfaces/resenas';

@Component({
  imports: [NavbarComponent, DatePipe, RouterLink],
  selector: 'app-funciones',
  styleUrl: './funciones.css',
  templateUrl: './funciones.html',
})
export class Funciones{
  logo_menus = "/assets/imagenes/Gemini2.png"
  private route = inject(ActivatedRoute);
  private funcionService = inject(FuncionService);
  private peliculaService = inject(PeliculaService);

  pelicula = signal<Pelicula | null>(null);
  funciones = signal<Funcion[]>([]);
  resenas = signal<Resenas[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      const peliculaId = params['peliculaId'] as string | undefined;
      
      if (peliculaId) {
        this.mostrar_pelicula(peliculaId);
      } else {
        this.cargando.set(false);
        
      }
    });
  }

  promedioEstrellas = computed(() => {
    const lista = this.resenas();
    if (!lista || lista.length === 0) return 0;
    const suma = lista.reduce((acc, curr) => acc + curr.estrellas, 0);
    return (suma / lista.length).toFixed(1);
  });
  
  async mostrar_pelicula(peliculaId: string) {
    try {
      this.cargando.set(true);
      const listaFunciones = await this.funcionService.mostrar_funcion_por_id(peliculaId);
      this.funciones.set(listaFunciones);
      const datosPelicula = await this.peliculaService.mostrar_pelicula_id(peliculaId);
      this.pelicula.set(datosPelicula.pelicula);
      this.resenas.set(datosPelicula.resenas)
    } catch (error) {
      console.error('Error al cargar las funciones:', error);
    } finally {
      this.cargando.set(false);
    }
  }
}
