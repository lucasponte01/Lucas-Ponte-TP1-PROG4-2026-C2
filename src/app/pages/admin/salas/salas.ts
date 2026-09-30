import { Component, inject, signal } from '@angular/core';
import { FuncionService } from '../../../services/funciones/funciones';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { SalaService } from '../../../services/salas/salas';
import { Auth } from '../../../services/auth';
import Sala from '../../../interfaces/salas';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-salas',
  styleUrl: './salas.css',
  templateUrl: './salas.html',
})
export class SalasAdmin {

//RF-25: distribución de butacas y productos.
//RF-26: Reporte de facturación diaria y cantidad de entradas vendidas, exportable a PDF y Excel.
//RF-27: Gráficos de películas más vistas por semana/mes y producto de candy bar más vendido.
//RF-28: Log de actividad: quién creó una función, quién modificó un precio, quién validó un QR — todo con fecha y hora.
 bd = inject(FuncionService);
  peliculasBd = inject(PeliculaService);
  salasBd = inject(SalaService);
  auth = inject(Auth);

  error = signal('');
  Guardando = signal(false);
  vistaActiva = signal<string>('crear');

  
  salas = signal<Sala[]>([]);

  cambiarVista(vista: string) {
      this.vistaActiva.set(vista);
      this.traer_salas();
  }

     async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }


    async traer_salas(){
      this.salas.set(await this.salasBd.mostrar_sala());
    } 
    //crear sala
    form_crear = new FormGroup({
        nombre: new FormControl('', [Validators.required]),
    })
    async crear_sala(): Promise<void> {
    this.error.set('');
    if (this.form_crear.invalid) return;

    this.Guardando.set(true);
    try {
      const nombre = this.form_crear.getRawValue().nombre!;
      await this.salasBd.crear_sala({ nombre });

      this.form_crear.reset();
      await this.traer_salas();
    } catch (e) {
      console.error(e);
      this.error.set('Error al crear la sala');
    } finally {
      this.Guardando.set(false);
    }
  }
  //modificar sala
  sala_seleccionada = signal<Sala | null>(null);

  form_modificar = new FormGroup({
    numero: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

  form_edicion = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
  });

  sala_a_modificar(): void {
    this.error.set('');
    const numero = this.form_modificar.getRawValue().numero;
    const lista = this.salas();

    if (!numero || numero < 1 || numero > lista.length) {
      this.sala_seleccionada.set(null);
      this.error.set('Número inválido');
      return;
    }

    const sala = lista[numero - 1];
    this.sala_seleccionada.set(sala);
    this.form_edicion.patchValue({ nombre: sala.nombre });
  }

  async guardar_modificacion_sala(): Promise<void> {
    const original = this.sala_seleccionada();
    if (!original || this.form_edicion.invalid) return;

    this.error.set('');
    this.Guardando.set(true);
    try {
      const nombre = this.form_edicion.getRawValue().nombre!;
      await this.salasBd.modificar_sala(original.id, { nombre });

      await this.traer_salas();
      this.sala_seleccionada.set(null);
      this.form_modificar.reset();
    } catch (e) {
      console.error(e);
      this.error.set('Error al modificar la sala');
    } finally {
      this.Guardando.set(false);
    }
  }
  //eliminar salas

  form_eliminar = new FormGroup({
    numero: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

  async eliminar_salas(): Promise<void> {
    this.error.set('');
    const numero = this.form_eliminar.getRawValue().numero;
    const lista = this.salas();

    if (!numero || numero < 1 || numero > lista.length) {
      this.error.set('Número inválido');
      return;
    }

    const funcion = lista[numero - 1];

    try {
      await this.salasBd.eliminar_sala(funcion.id);
      this.form_eliminar.reset();
      await this.traer_salas();
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