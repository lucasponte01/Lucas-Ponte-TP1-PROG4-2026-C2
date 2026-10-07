import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Reseñas } from '../../services/resenas/reseñas';
import { ActivatedRoute, Router } from '@angular/router';
import { PeliculaService } from '../../services/peliculas/peliculas';
import { NavbarComponent } from '../../components/ui/navbar/navbar';
import { MinAHsPipe } from '../../components/ui/pipe/min-a-hs-pipe';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResenasPorCrear } from '../../interfaces/resenas';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../components/ui/error-pattern/error-pattern';

@Component({
  imports: [NavbarComponent, MinAHsPipe, ReactiveFormsModule, CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, ErrorPattern],
  selector: 'app-resenas',
  styleUrl: './resenas.css',
  templateUrl: './resenas.html',
})
export class Resenas {
  logo_menus = "/assets/imagenes/Gemini2.png"
  private route = inject(ActivatedRoute);
  private peliculaService = inject(PeliculaService);
  private resenas = inject(Reseñas)
  ruta = inject(Router);
  
  pelicula = signal<any>(null);
  
  cargando = signal<boolean>(true);

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const peliculaId = params['peliculaId'];
      if (peliculaId) {
        await this.cargar_Datos_Detalle(peliculaId);
      }
    });
  }

  form_crear_resena = new FormGroup({
    estrellas: new FormControl<number | null>(null, [Validators.required , Validators.minLength(1) , Validators.maxLength(5)]),
    comentario: new FormControl<string | null>('', [Validators.required , Validators.minLength(10) , Validators.maxLength(150), Validators.pattern(/^[a-zA-Z0-9\s]+$/)]),
  });


  async cargar_Datos_Detalle(id: string) {
      
      this.cargando.set(true);
      try {
        const respuesta = await this.peliculaService.mostrar_pelicula_id(id);

        this.pelicula.set(respuesta.pelicula);

      } catch (error) {
        console.error('Error al cargar detalles de la película:', error);
      } finally {
        this.cargando.set(false);
      }
    }

  async crear_resena_pelicula() {
    if (this.form_crear_resena.invalid || !this.pelicula()) return;
    this.cargando.set(true);
    try {
      const datosResena = {
        pelicula_id: this.pelicula().id,
        estrellas: this.form_crear_resena.value.estrellas,
        comentario: this.form_crear_resena.value.comentario
      };
      await this.resenas.crear_resena(datosResena as ResenasPorCrear);
      this.form_crear_resena.reset();
      this.ruta.navigate(['/home']);
    } catch (error) {
      console.error('Error al crear la reseña:', error);
    } finally {
      this.cargando.set(false);
    }
  }
}
