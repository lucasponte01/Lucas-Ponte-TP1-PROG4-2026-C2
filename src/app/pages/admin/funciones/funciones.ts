import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionService } from '../../../services/funciones/funciones';
import { Funcion, FuncionPorCrear, FuncionPorModificar } from '../../../interfaces/funcion';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { SalaService } from '../../../services/salas/salas';
import Pelicula from '../../../interfaces/peliculas';
import Salas from '../../../interfaces/salas';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-funciones',
  styleUrl: './funciones.css',
  templateUrl: './funciones.html',
})
export class FuncionesAdmin {
  bd = inject(FuncionService);
  peliculasBd = inject(PeliculaService);
  salasBd = inject(SalaService);
  auth = inject(Auth);

  error = signal('');
  Guardando = signal(false);
  vistaActiva = signal<string>('crear');

  funciones = signal<Funcion[]>([]);
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Salas[]>([]);
  lista: any;
  num: any;
  item: any;

  async ngOnInit() {
    this.peliculas.set(await this.peliculasBd.mostrarpeliculas());
    this.salas.set(await this.salasBd.mostrar_sala());
    await this.traer_funciones();
  }

  cambiarVista(vista: string) {
      this.vistaActiva.set(vista);
      this.error.set('');
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
    fin: new FormControl('', [Validators.required]),
    formato: new FormControl('2D', [Validators.required]),
    idioma: new FormControl('castellano', [Validators.required]),
    precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    es_preventa: new FormControl(false),
  });

  async crear_funcion(): Promise<void> {
    this.error.set('');
    if (this.form_crear.invalid) return;
    this.Guardando.set(true);


    this.Guardando.set(true);
    try {
      await this.bd.crear_funcion(this.form_crear.value as FuncionPorCrear);

      this.form_crear.reset({ formato: '2D', idioma: 'castellano', es_preventa: false });
      await this.traer_funciones();
    } catch {
        this.error.set('Error al crear la función');
    } finally {
      this.Guardando.set(false);
    }
  }
  
  //modificar funcion 

  funcion_seleccionada = signal<boolean | null>(null);

  form_modificar = new FormGroup({
    numero: new FormControl<number | null>(null, [Validators.required, Validators.min(1)])
  });

    form_edicion = new FormGroup({
      id: new FormControl('', [Validators.required]),
      pelicula_id: new FormControl('', [Validators.required]),
      sala_id: new FormControl('', [Validators.required]),
      inicio: new FormControl('', [Validators.required]),
      fin: new FormControl('', [Validators.required]),
      formato: new FormControl('2D', [Validators.required]),
      idioma: new FormControl('castellano', [Validators.required]),
      precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
      es_preventa: new FormControl(false),
    });

    seleccionar_funcion_para_editar(index: number) {
    const lista = this.funciones();
    const item = lista[index];
    if (!item) return;

    this.funcion_seleccionada.set(true);
    this.form_modificar.controls.numero.setValue(index + 1);
    
    this.form_edicion.setValue({
      id: item.id,
      pelicula_id: item.pelicula_id,
      sala_id: item.sala_id,
      inicio: item.inicio ? item.inicio.slice(0, 16) : '', 
      fin: item.fin ? item.fin.slice(0, 16) : '',
      formato: item.formato,
      idioma: item.idioma,
      precio_base: item.precio_base,
      precio_vip: item.precio_vip,
      es_preventa: item.es_preventa ?? false
    });
  }

  buscar_funcion_por_numero() {
    const num = this.form_modificar.value.numero;
    if (!num) return;
    const index = num - 1;
    if (index >= 0 && index < this.funciones().length) {
      this.seleccionar_funcion_para_editar(index);
    } else {
      this.error.set('Número de función no válido');
    }
  }

    async modificacion_funcion(): Promise<void> {
      this.error.set('');
      if (this.form_edicion.invalid) return;
      this.Guardando.set(true);

      try {
       await this.bd.modificar_funcion(this.form_edicion.value as FuncionPorModificar);

        await this.traer_funciones();
        this.funcion_seleccionada.set(null);
        this.form_edicion.reset({ formato: '2D', idioma: 'castellano', es_preventa: false });
        this.form_modificar.reset();
      } catch  {
        this.error.set('Error al modificar la función');
        
      } finally {
        this.Guardando.set(false);
      }
    }

    //eliminar funcion
    form_eliminar = new FormGroup({
    id: new FormControl<number | null>(null, Validators.required)
  });

  

  seleccionar_funcion_para_eliminar(index: number) {
    this.form_eliminar.controls.id.setValue(index + 1);
  }

  async eliminar_funcion(): Promise<void> {
    this.error.set('');
    if (this.form_eliminar.invalid) return;
    
    const num = this.form_eliminar.value.id;
    if (!num) {
      this.error.set('Por favor, ingresa un número de función válido');
      return;
    }

    const lista = this.funciones();
    const item = lista[num - 1]; // Usamos 'num' directamente sabiendo que no es nulo

    if (!item) {
      this.error.set('Función no encontrada');
      return;
    }

    this.Guardando.set(true);
    try {
      await this.bd.eliminar_funcion(item.id); 
      this.form_eliminar.reset();
      await this.traer_funciones();
    } catch {
      this.error.set('Error al eliminar la función');
    } finally {
      this.Guardando.set(false);
    }
  }
}

