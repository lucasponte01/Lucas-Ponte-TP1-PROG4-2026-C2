import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionesService } from '../../../services/funciones/funciones';
import { Funcion } from '../../../interfaces/funcion';
import { PeliculasServices } from '../../../services/peliculas/peliculas';
import { salasServices } from '../../../services/salas/salas';
import Pelicula from '../../../interfaces/peliculas';
import Salas from '../../../interfaces/salas';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-funciones',
  styleUrl: './funciones.css',
  templateUrl: './funciones.html',
})
export class Funciones {
  bd = inject(FuncionesService);
  peliculasBd = inject(PeliculasServices);
  salasBd = inject(salasServices);
  auth = inject(Auth);

  error = signal('');
  isGuardando = signal(false);
  vistaActiva = signal<string>('crear');

  funciones = signal<Funcion[]>([]);
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Salas[]>([]);

  async ngOnInit() {
    this.peliculas.set(await this.peliculasBd.mostrarpeliculas());
    this.salas.set(await this.salasBd.mostrar_sala());
    await this.traer_funciones();
  }

  cambiarVista(vista: string) {
      this.vistaActiva.set(vista);
      this.traer_funciones();
      this.traer_peliculas();
      this.traer_salas();
  }

     async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }

  async traer_peliculas(){
    this.peliculas.set(await this.peliculasBd.mostrarpeliculas()) ;
    }

  async traer_funciones(){
    this.funciones.set(await this.bd.mostrar_funcion()) ;
    }

  async traer_salas(){
    this.salas.set(await this.salasBd.mostrar_sala());
  } 


  //crear funcion 
  form_crear = new FormGroup({
    pelicula_id: new FormControl('', [Validators.required]),
    sala_id: new FormControl('', [Validators.required]),
    inicio: new FormControl('', [Validators.required]), 
    formato: new FormControl('2D', [Validators.required]),
    idioma: new FormControl('castellano', [Validators.required]),
    precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    es_preventa: new FormControl(false),
  });

  async crear_funcion(): Promise<void> {
    this.error.set('');
    if (this.form_crear.invalid) return;

    const v = this.form_crear.getRawValue();
    const pelicula = this.peliculas().find(p => p.id === v.pelicula_id);

    if (!pelicula) {
      this.error.set('Seleccioná una película válida');
      return;
    }

    const inicio = new Date(v.inicio!);
    const fin = new Date(inicio.getTime() + pelicula.duracion_min * 60000);

    this.isGuardando.set(true);
    try {
      await this.bd.crear_funcion({
        pelicula_id: v.pelicula_id!,
        sala_id: v.sala_id!,
        inicio: inicio.toISOString(),
        fin: fin.toISOString(),
        formato: v.formato!,
        idioma: v.idioma!,
        precio_base: v.precio_base!,
        precio_vip: v.precio_vip!,
        es_preventa: v.es_preventa!,
      });

      this.form_crear.reset({ formato: '2D', idioma: 'castellano', es_preventa: false });
      await this.traer_funciones();
    } catch (e: any) {
      console.error(e);
      if (e?.code === '23P01') {
        this.error.set('Esa sala ya tiene otra función en ese horario (con el margen de 30 min de limpieza)');
      } else {
        this.error.set('Error al crear la función');
      }
    } finally {
      this.isGuardando.set(false);
    }
  }
  //arreglar errores 
  //modificar funcion 

  funcion_seleccionada = signal<Funcion | null>(null);

    form_modificar = new FormGroup({
      numero: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
    });

    form_edicion = new FormGroup({
      pelicula_id: new FormControl('', [Validators.required]),
      sala_id: new FormControl('', [Validators.required]),
      inicio: new FormControl('', [Validators.required]),
      formato: new FormControl('2D', [Validators.required]),
      idioma: new FormControl('castellano', [Validators.required]),
      precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      es_preventa: new FormControl(false),
    });

    private isoADatetimeLocal(iso: string): string {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    //arreglar el return 
    funcion_a_modificar(): void {
      this.error.set('');
      const numero = this.form_modificar.getRawValue().numero;
      const lista = this.funciones();

      if (!numero || numero < 1 || numero > lista.length) {
        this.funcion_seleccionada.set(null);
        this.error.set('Número inválido');
        return;
      }

      const funcion = lista[numero - 1];
      this.funcion_seleccionada.set(funcion);
      this.form_edicion.patchValue({
        pelicula_id: funcion.pelicula_id,
        sala_id: funcion.sala_id,
        inicio: this.isoADatetimeLocal(funcion.inicio),
        formato: funcion.formato,
        idioma: funcion.idioma,
        precio_base: funcion.precio_base,
        precio_vip: funcion.precio_vip,
        es_preventa: funcion.es_preventa,
      });
    }

    async guardar_modificacion_funcion(): Promise<void> {
      const original = this.funcion_seleccionada();
      if (!original || this.form_edicion.invalid) return;

      const v = this.form_edicion.getRawValue();
      const pelicula = this.peliculas().find(p => p.id === v.pelicula_id);
      if (!pelicula) {
        this.error.set('Seleccioná una película válida');
        return;
      }

      const inicio = new Date(v.inicio!);
      const fin = new Date(inicio.getTime() + pelicula.duracion_min * 60000);

      this.error.set('');
      this.isGuardando.set(true);
      try {
        await this.bd.modificar_funcion(original.id, {
          pelicula_id: v.pelicula_id!,
          sala_id: v.sala_id!,
          inicio: inicio.toISOString(),
          fin: fin.toISOString(),
          formato: v.formato!,
          idioma: v.idioma!,
          precio_base: v.precio_base!,
          precio_vip: v.precio_vip!,
          es_preventa: v.es_preventa!,
        });

        await this.traer_funciones();
        this.funcion_seleccionada.set(null);
        this.form_modificar.reset();
      } catch (e: any) {
        console.error(e);
        if (e?.code === '23P01') {
          this.error.set('Esa sala ya tiene otra función en ese horario (con el margen de 30 min de limpieza)');
        } else {
          this.error.set('Error al modificar la función');
        }
      } finally {
        this.isGuardando.set(false);
      }
    }

    //eliminar funcion
    form_eliminar = new FormGroup({
    numero: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

  async eliminar_funcion(): Promise<void> {
    this.error.set('');
    const numero = this.form_eliminar.getRawValue().numero;
    const lista = this.funciones();

    if (!numero || numero < 1 || numero > lista.length) {
      this.error.set('Número inválido');
      return;
    }

    const funcion = lista[numero - 1];

    try {
      await this.bd.eliminar_funcion(funcion.id);
      this.form_eliminar.reset();
      await this.traer_funciones();
    } catch (e: any) {
      console.error(e);
      if (e?.code === '23503') {
        this.error.set('No se puede eliminar: la función tiene entradas vendidas');
      } else {
        this.error.set('Error al eliminar la función');
      }
    }
  }
}
