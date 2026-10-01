import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { SupabaseService } from '../../../services/supabase.service';
import Pelicula, { PeliculaPorCrear, PeliculaPorModificar } from '../../../interfaces/peliculas';
import { Auth } from '../../../services/auth';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';

@Component({
  imports: [ReactiveFormsModule, NavbarComponent ],
  selector: 'app-peliculas',
  styleUrl: './peliculas.css',
  templateUrl: './peliculas.html',
})
export class PeliculasAdmin {
volver(arg0: string) {
throw new Error('Method not implemented.');
}
  logo_menus = "/assets/imagenes/Gemini2.png"
  bd = inject(PeliculaService);
  storage = inject(SupabaseService);
  auth = inject(Auth);
  error = signal('');
  Guardando = signal(false);
  vistaActiva = signal<string>('crear');
  fb = inject(FormBuilder);
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

  async  traer_peliculas(){
    this.peliculas.set(await this.bd.mostrarpeliculas()) ;
    }
//crear peliculas
    form_crear = this.fb.group({
    nombre: new FormControl('', [Validators.required]),
    sinopsis: new FormControl('', [Validators.required]),
    duracion_min: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    restriccion_edad: new FormControl<number | null>(null),
    fecha_estreno: new FormControl('', [Validators.required]),
    preventa_pct_descuento: new FormControl<number | null>(null),
    generos: new FormControl('', [Validators.required]),
    foto: new FormControl<File | null>(null, [Validators.required])
  });

  cargarImagenCrear(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files && elemento.files.length > 0) {
      this.form_crear.controls.foto.setValue(elemento.files[0]);
    }
  }

  async crear_pelicula(): Promise<void> {
    this.error.set('');
    if (this.form_crear.invalid) return;
    this.Guardando.set(true);

    try {
      const valores = this.form_crear.value.foto;

      const urlImagen = await this.bd.subirArchivo(valores!);
      if (!urlImagen) {
        this.error.set('Error al subir la imagen');
        return;
      }

      const datos = this.form_crear.value.generos ?? '';
      const generos: string[] = [];
      for (const g of datos.toString().split(',')) {
        const limpio = g.trim();
        if (limpio) generos.push(limpio);
      }

      const nuevaPelicula: PeliculaPorCrear = {
        nombre: this.form_crear.value.nombre!,
        sinopsis: this.form_crear.value.sinopsis!,
        duracion_min: this.form_crear.value.duracion_min!,
        restriccion_edad: this.form_crear.value.restriccion_edad ?? null,
        fecha_estreno: this.form_crear.value.fecha_estreno!,
        preventa_pct_descuento: this.form_crear.value.preventa_pct_descuento ?? 0,
        generos: generos,
        imagen_url: urlImagen
      };

      await this.bd.crear_pelicula(nuevaPelicula);
      this.form_crear.reset();
      await this.traer_peliculas();
    } catch {
      this.error.set('Error al crear la película');
    } finally {
      this.Guardando.set(false);
    }
  }

    //eliminar pelicula
    form_eliminar = new FormGroup({
      nombre: new FormControl<string | null>(null, [Validators.required])
    })

    async eliminar_pelicula(){
      this.error.set('');
      if(this.form_eliminar.invalid){
        return;
      }
      this.Guardando.set(true);
      try{
        if (this.form_eliminar.value.nombre) {
        await this.bd.eliminar_pelicula(this.form_eliminar.value.nombre);
      }
        this.form_eliminar.reset();
        await this.traer_peliculas();
      } catch  {
        this.error.set('Error al eliminar la película');
      }finally{
        this.Guardando.set(false);
      }
    }


    //modificar peliculas
    pelicula_seleccionada = signal<boolean>(false);

    form_edicion = new FormGroup({
        id: new FormControl('', [Validators.required]),
        nombre: new FormControl('', [Validators.required]),
        sinopsis: new FormControl('', [Validators.required]),
        duracion_min: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
        restriccion_edad: new FormControl<number | null>(null, [Validators.min(0), Validators.max(120)]),
        fecha_estreno: new FormControl('', [Validators.required]),
        preventa_pct_descuento: new FormControl<number | null>(null),
        generos: new FormControl('', [Validators.required]),
        imagen_url: new FormControl<File | string | null>(null)
    });

    seleccionar_pelicula_para_editar(pelicula: any) {
    this.pelicula_seleccionada.set(true);
    this.error.set('');

    this.form_edicion.setValue({
      id: pelicula.id,
      nombre: pelicula.nombre,
      sinopsis: pelicula.sinopsis,
      duracion_min: pelicula.duracion_min,
      restriccion_edad: pelicula.restriccion_edad,
      fecha_estreno: pelicula.fecha_estreno,
      preventa_pct_descuento: pelicula.preventa_pct_descuento,
      generos: pelicula.generos?.join(', ') || null,
      imagen_url: pelicula.imagen_url || null
    });
    }  
    
    cargarImagenEditar(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files && elemento.files.length > 0) {
      this.form_edicion.controls.imagen_url.setValue(elemento.files[0]);
    }
  }

    async modificar_pelicula(): Promise<void> {
      console.log("1. ¡Entró a modificar_pelicula!");
      this.error.set('');
      if (this.form_edicion.invalid) return;
      
      console.log("2. Estado del formulario (invalid?):", this.form_edicion.invalid);
      console.log("3. Valores del formulario:", this.form_edicion.value);
      this.Guardando.set(true);

      try {
        
        let urlImagen = this.form_edicion.value.imagen_url;

        if (urlImagen instanceof File) {
          console.log("5. Subiendo archivo nuevo al Storage...");
          const subida = await this.bd.subirArchivo(urlImagen);
          if (!subida) {
            this.error.set('Error al subir la imagen');
            this.Guardando.set(false);
            return;
          }
          urlImagen = subida; 
        }

        console.log("4. URL de imagen a guardar:", urlImagen);

        const v = this.form_edicion.value.generos ?? '';
        const generos: string[] = [];
        for (const g of v.toString().split(',')) {
          const limpio = g.trim();
          if (limpio) generos.push(limpio);
        }

        const peliculaModificada: PeliculaPorModificar = {
          id: this.form_edicion.value.id!,
          nombre: this.form_edicion.value.nombre!,
          sinopsis: this.form_edicion.value.sinopsis!,
          duracion_min: this.form_edicion.value.duracion_min!,
          restriccion_edad: this.form_edicion.value.restriccion_edad ?? null,
          fecha_estreno: this.form_edicion.value.fecha_estreno!,
          preventa_pct_descuento: this.form_edicion.value.preventa_pct_descuento ?? 0,
          generos: generos,
          imagen_url: urlImagen as string 
        };

        console.log("7. Enviando a Supabase:", peliculaModificada);
        await this.bd.modificar_pelicula(peliculaModificada);
        
        this.form_edicion.reset();
        this.pelicula_seleccionada.set(false);
        await this.traer_peliculas();
        console.log("8. ¡Modificación en Supabase exitosa!");
        
      } catch (e) {
        console.error("Error al modificar:", e);
        this.error.set('Error al modificar la película');
      } finally {
        this.Guardando.set(false);
      }
    }
}
