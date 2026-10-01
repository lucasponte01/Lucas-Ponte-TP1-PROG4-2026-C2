import { Component, inject, signal } from '@angular/core';
import { FuncionService } from '../../../services/funciones/funciones';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { SalaService } from '../../../services/salas/salas';
import { Auth } from '../../../services/auth';
import Sala, { SalasPorCrear } from '../../../interfaces/salas';
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
    
    if (this.form_crear.invalid) return;

    this.Guardando.set(true);
    try {
      this.salasBd.crear_sala(this.form_crear.value as SalasPorCrear);

      this.form_crear.reset();
      await this.traer_salas();
    } catch{
       this.error.set('error al crear sala');
    }finally{
      this.Guardando.set(false);
    }
    

  }
  //modificar sala
  sala_seleccionada = signal<boolean>(false);
  form_edicion = new FormGroup({
    id:new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
  });

    seleccionar_sala_para_editar(sala: any) {
    this.sala_seleccionada.set(true);
    this.error.set('');

    this.form_edicion.setValue({
      id: sala.id,
      nombre: sala.nombre
    });
  }

  async modificacion_sala(): Promise<void> {
    
    if (this.form_edicion.invalid) return;

    this.error.set('');
    this.Guardando.set(true);
    try {
    
      await this.salasBd.modificar_sala(this.form_edicion.value as Sala);

      await this.traer_salas();
      
    } catch {
      this.error.set('Error al modificar la sala');
    } finally {
      this.Guardando.set(false);
    }
  }
  //eliminar salas
  
  form_eliminar = new FormGroup({
    nombre: new FormControl<string | null>(null, [Validators.required])
  });

  async eliminar_salas(): Promise<void> {
    this.error.set('');
    if (this.form_eliminar.invalid) {
      return;
    }

    this.Guardando.set(true);
    try {
      if (this.form_eliminar.value.nombre) {
        await this.salasBd.eliminar_sala(this.form_eliminar.value.nombre);
      }
      this.form_eliminar.reset();
      await this.traer_salas();
    } catch {
      this.error.set('Error al eliminar la sala');
    } finally {
      this.Guardando.set(false);
    }
  }
}