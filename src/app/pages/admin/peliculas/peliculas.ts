import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeliculasServices } from '../../../services/peliculas/peliculas';
import { SupabaseService } from '../../../services/supabase.service';
import Pelicula from '../../../interfaces/peliculas';
import { Auth } from '../../../services/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-peliculas',
  styleUrl: './peliculas.css',
  templateUrl: './peliculas.html',
})
export class Peliculas {
  bd = inject(PeliculasServices);
  storage = inject(SupabaseService);
  auth = inject(Auth);
  error = signal('');
  isGuardando = signal(false);
  vistaActiva = signal<string>('crear');

  peliculas = signal<Pelicula[]>([]);

  cambiarVista(vista: string) {
    this.vistaActiva.set(vista);
    this.traer_peliculas();
  
  }

  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }
//crear peliculas
    form_crear = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      sinopsis: new FormControl('', [Validators.required]),
      duracion_min: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      restriccion_edad: new FormControl<number | null>(null),
      fecha_estreno: new FormControl('', [Validators.required]),
      preventa_pct_descuento: new FormControl<number | null>(null),
      generos: new FormControl('', [Validators.required]),
      foto: new FormControl<File | null>(null, Validators.required),
    });



  onArchivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.form_crear.controls.foto.setValue(input.files?.[0] ?? null);
  }

  async crear(): Promise<void> {
    this.error.set('');
    if (this.form_crear.invalid) return;

      this.isGuardando.set(true);
      try {
        const valores = this.form_crear.getRawValue();

        const generos: string[] = [];
        for (const g of valores.generos!.split(',')) {
          const limpio = g.trim();
          if (limpio) generos.push(limpio);
        }

        await this.bd.crear_pelicula(
          {
            nombre: valores.nombre!,
            sinopsis: valores.sinopsis!,
            duracion_min: valores.duracion_min!,
            restriccion_edad: valores.restriccion_edad,
            fecha_estreno: valores.fecha_estreno!,
            preventa_pct_descuento: valores.preventa_pct_descuento ?? 0,
            generos
          },
          valores.foto!
        );

        this.form_crear.reset();
      } catch (e) {
        console.error(e);
        this.error.set('Error al crear la película');
      } finally {
        this.isGuardando.set(false);
      }
    }

    //eliminar pelicula
    form_eliminar = new FormGroup({
      nombre: new FormControl('', [Validators.required])
    })

    async  traer_peliculas(){
    this.peliculas.set(await this.bd.mostrarpeliculas()) ;
    }

    async eliminar_pelicula(){
      const valores = this.form_eliminar.getRawValue();
      const nombre = valores.nombre?.trim();

      if (!nombre) {
        this.error.set('Debe indicar un nombre válido');
        return;
      }

      try{
        await this.bd.eliminar_pelicula(nombre);
        this.form_eliminar.reset();
      } catch (e) {
        console.error(e);
        this.error.set('Error al eliminar la película');
      }
    }
    //modificar peliculas

    peliculas_seleccionada = signal<Pelicula | null>(null);
    nuevaFoto = signal<File | null>(null);

     form_modificar = new FormGroup({
      nombre: new FormControl('', [Validators.required])
    })

    form_edicion = new FormGroup({
        nombre: new FormControl('', [Validators.required]),
        sinopsis: new FormControl('', [Validators.required]),
        duracion_min: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
        restriccion_edad: new FormControl<number | null>(null),
        fecha_estreno: new FormControl('', [Validators.required]),
        preventa_pct_descuento: new FormControl<number | null>(null),
        generos: new FormControl('', [Validators.required]),
    });


    pelicula_a_modificar(): void {
      this.error.set('');
      const nombre = this.form_modificar.getRawValue().nombre?.trim().toLowerCase();
      const pelicula = this.peliculas().find(p => p.nombre.toLowerCase() === nombre);

      if (!pelicula) {
        this.peliculas_seleccionada.set(null);
        this.error.set('No se encontró una película con ese nombre');
        return;
      }

      this.peliculas_seleccionada.set(pelicula);
      this.nuevaFoto.set(null);
      this.form_edicion.patchValue({
        nombre: pelicula.nombre,
        sinopsis: pelicula.sinopsis,
        duracion_min: pelicula.duracion_min,
        restriccion_edad: pelicula.restriccion_edad,
        fecha_estreno: pelicula.fecha_estreno,
        preventa_pct_descuento: pelicula.preventa_pct_descuento,
        generos: pelicula.generos.join(', ')
      });
    }

    onNuevaFoto(evento: Event): void {
      const input = evento.target as HTMLInputElement;
      this.nuevaFoto.set(input.files?.[0] ?? null);
    }

    async guardar_modificacion(): Promise<void> {
      const original = this.peliculas_seleccionada();
      if (!original || this.form_edicion.invalid) return;

      this.error.set('');
      this.isGuardando.set(true);
      try {
        const v = this.form_edicion.getRawValue();

        const generos: string[] = [];
        for (const g of v.generos!.split(',')) {
          const limpio = g.trim();
          if (limpio) generos.push(limpio);
        }

        await this.bd.modificar_pelicula(
          original,
          {
            nombre: v.nombre!,
            sinopsis: v.sinopsis!,
            duracion_min: v.duracion_min!,
            restriccion_edad: v.restriccion_edad,
            fecha_estreno: v.fecha_estreno!,
            preventa_pct_descuento: v.preventa_pct_descuento ?? 0,
            generos
          },
          this.nuevaFoto()
        );

        await this.traer_peliculas();
        this.peliculas_seleccionada.set(null);
        this.form_modificar.reset();
      } catch (e) {
        console.error(e);
        this.error.set('Error al modificar la película');
      } finally {
        this.isGuardando.set(false);
      }
    }
}
