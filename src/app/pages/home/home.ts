import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import {  ReactiveFormsModule } from '@angular/forms';
import Pelicula from '../../interfaces/peliculas';
import { Funcion } from '../../interfaces/funcion';
import { FuncionesService } from '../../services/funciones/funciones';
import { StorageService } from '../../services/storage/storage-service';
import { TexoLargoPipe } from '../../components/ui/pipe/pipe-texto-largo-pipe';
import { MinAHsPipe } from '../../components/ui/pipe/min-a-hs-pipe';
import { PeliculasServices } from '../../services/peliculas/peliculas';
import { CampoInput } from '../../components/ui/campo-input/campo-input';

@Component({
  imports: [RouterLink, ReactiveFormsModule, TexoLargoPipe, MinAHsPipe, CampoInput],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})

export class Home {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth);
  route = inject(Router);
  db = inject(PeliculasServices)
  funcion = inject(FuncionesService);
  stg = inject(StorageService);
 
  peliculas = signal<Pelicula[]>([]);
  funciones = signal<Funcion[]>([]);
  cargando = signal<boolean | null>(null)
  textoBusqueda = signal('');

  foto_pelicula = signal<string[]>([]);
  mostrarpeliculas = signal(false);
  cargando_peliculas = signal(false);


  PeliculasFiltrados = computed(() => {
  const texto = this.textoBusqueda().trim().toLowerCase();
    
  return this.peliculas().filter(
    pelicula => !texto || pelicula.generos.some(genero =>
        (genero).toLowerCase().includes(texto)
      )
    );
  });

  onBuscar(texto: string): void {
    this.textoBusqueda.set(texto);
  }


  ngOnInit() {
    this.cargando.set(true);
    try{
    this.traerTodas_peliculas();
    this.traerTodas_funciones();
    this.abrirSelectorpelis()
    }finally{
      this.cargando.set(false);
    }
  }


  async traerTodas_peliculas() {
    this.peliculas.set(await this.db.mostrarpeliculas());
    
  }

  async traerTodas_funciones() {
    this.funciones.set(await this.funcion.mostrar_funcion());
  }


  async abrirSelectorpelis(): Promise<void> {
  this.mostrarpeliculas.set(true);
  this.cargando_peliculas.set(true);

  try {
      const pelicula = await this.stg.listar_peliculas()
      this.foto_pelicula.set(pelicula);
    } catch (error) {
      console.error(error);
    } finally {
      this.cargando_peliculas.set(false);
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
