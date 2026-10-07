import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { ReactiveFormsModule } from '@angular/forms';
import Pelicula from '../../interfaces/peliculas';
import { Funcion } from '../../interfaces/funcion';
import { FuncionService } from '../../services/funciones/funciones';
import { StorageService } from '../../services/storage/storage-service';
import { MinAHsPipe } from '../../components/ui/pipe/min-a-hs-pipe';
import { PeliculaService } from '../../services/peliculas/peliculas';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { NavbarComponent } from '../../components/ui/navbar/navbar';

@Component({
  imports: [RouterLink, ReactiveFormsModule, MinAHsPipe, CampoInput, NavbarComponent],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth);
  route = inject(Router);
  db = inject(PeliculaService)
  funcion = inject(FuncionService);
  stg = inject(StorageService);
  
  peliculas = signal<Pelicula[]>([]);
  funciones = signal<Funcion[]>([]);
  cargando = signal<boolean | null>(null)
  textoBusqueda = signal('');

  foto_pelicula = signal<string[]>([]);
  mostrarpeliculas = signal(false);
  cargando_peliculas = signal(false);

  // Señal que define si el usuario conectado es admin
  esAdmin = signal<boolean>(false); 

  PeliculasFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const resultado: Pelicula[] = [];

    for (const pelicula of this.peliculas()) {
      if (!texto) {
        resultado.push(pelicula);
        continue;
      }

      const coincideNombre = pelicula.nombre.toLowerCase().includes(texto);
      let coincideGenero = false;
      for (const genero of pelicula.generos) {
        if (genero.toLowerCase().includes(texto)) {
          coincideGenero = true;
          break;
        }
      }

      if (coincideNombre || coincideGenero) {
        resultado.push(pelicula);
      }
    }

    return resultado;
  });

  onBuscar(texto: string): void {
    this.textoBusqueda.set(texto);
  }

  async ngOnInit() {
    this.cargando.set(true);
    try {
      await this.verificarRolUsuario();
      await this.traerTodas_peliculas();
      await this.traerTodas_funciones();
      await this.abrirSelectorpelis();
    } finally {
      this.cargando.set(false);
    }
  }

  
  async verificarRolUsuario() {
    const user = this.auth.usuarioActual(); 
    if (user) {
      const { data } = await this.stg.client
        .from('usuarios')
        .select('tipo')
        .eq('id', user.id)
        .maybeSingle();

      if (data && data.tipo?.trim() === 'admin') {
        this.esAdmin.set(true);
      } else {
        this.esAdmin.set(false);
      }
    }
  }

  async traerTodas_peliculas() {
    this.peliculas.set(await this.db.mostrarpeliculas());
  }

  async traerTodas_funciones() {
    this.funciones.set(await this.funcion.mostrar_funcion());
  }

   verDetallePelicula(pelicula: any) {
   
  const tienePermiso = this.auth.verificarAccesoPelicula(pelicula.restriccion_edad);
    console.log("¿Tiene acceso?", tienePermiso);
  if (tienePermiso) {
    this.route.navigate(['compra/peliculas_detalle'], { 
      queryParams: { peliculaId: pelicula.id } 
    });
  } else {
    if (pelicula.restriccion_edad == 16){
      alert(`Contenido restringido: Esta película es clasificación +${pelicula.restriccion_edad}. No cumples con la edad requerida.`);
    }else if (pelicula.restriccion_edad == 18){
      alert(`Contenido restringido: Esta película es clasificación +${pelicula.restriccion_edad}. Solo pueder asistir un adulto.`);
    }
  }
}


  async abrirSelectorpelis(): Promise<void> {
    this.mostrarpeliculas.set(true);
    this.cargando_peliculas.set(true);
    try {
      const pelicula = await this.stg.listar_peliculas();
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
      this.route.navigate(['/login']);
    } catch (error) {
      console.error(error);
    }
  }
}