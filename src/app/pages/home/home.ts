import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Peliculas } from '../../services/peliculas/peliculas';
import { Pelicula } from '../../interfaces/peliculas';
import { Funcion } from '../../interfaces/funcion';
import { Funciones } from '../../services/funciones.ts/funciones';
import { StorageService } from '../../services/storage/storage-service';
import { TexoLargoPipe } from '../../components/ui/pipe/pipe-texto-largo-pipe';
import { MinAHsPipe } from '../../components/ui/pipe/min-a-hs-pipe';
@Component({
  imports: [RouterLink , ReactiveFormsModule ,TexoLargoPipe , MinAHsPipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})

//visual del home poner que los botones se opaquen cuando pasas x arriba
//mirar requerimientos :
/*
3.1 Catálogo de películas
RF-01: Cada película tiene nombre, imagen, sinopsis, duración, uno o más géneros, formato (2D/3D/4D/5D) e idioma (castellano/subtitulada).
RF-02: Listado de películas con buscador, filtrable por género (múltiple).
RF-03: La home muestra primero las 3 películas más vendidas.
RF-04: Sección "Próximamente" con películas de estreno futuro; el usuario puede activar una alerta para ser notificado cuando se habilite la venta.
RF-05: Preventa configurable por película: se abre 7 días antes del estreno con un % de descuento configurable sobre el precio normal; al llegar la fecha de estreno, el precio vuelve al valor normal automáticamente.
RF-06: Cada película puede tener restricción de edad (18+, 13+, sin restricción). Usuarios por debajo de la edad no pueden comprar esa entrada; toda entrada de una película con restricción debe indicar que debe asistir un adulto.
*/

export class Home {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth);
  route = inject(Router);
  pelis = inject(Peliculas);
  funcion = inject(Funciones);
  stg = inject(StorageService);

  peliculas = signal<Pelicula[]>([]);
  funciones = signal<Funcion[]>([]);
  loading = signal<boolean | null>(null)

  foto_pelicula = signal<string[]>([]);
  mostrarpeliculas = signal(false);
  isLoadingpeliculas = signal(false);


  ngOnInit() {
    this.loading.set(true);
    try{
    this.traerTodas_peliculas();
    this.traerTodas_funciones();
    this.abrirSelectorpelis()
    }finally{
      this.loading.set(false);
    }
  }


  async traerTodas_peliculas() {
    this.peliculas.set(await this.pelis.mostrarpeliculas());
    
  }

  async traerTodas_funciones() {
    this.funciones.set(await this.funcion.mostrarfuncin());
  }


  async abrirSelectorpelis(): Promise<void> {
  this.mostrarpeliculas.set(true);
  this.isLoadingpeliculas.set(true);

  try {
      const pelicula = await this.stg.listar_peliculas()
      this.foto_pelicula.set(pelicula);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoadingpeliculas.set(false);
    } 
  } 

  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }
}
