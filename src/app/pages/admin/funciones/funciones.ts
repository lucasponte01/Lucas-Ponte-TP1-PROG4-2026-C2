import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionService } from '../../../services/funciones/funciones';
import { Funcion, FuncionPorCrear, FuncionPorModificar } from '../../../interfaces/funcion';
import { PeliculaService } from '../../../services/peliculas/peliculas';
import { SalaService } from '../../../services/salas/salas';
import Pelicula from '../../../interfaces/peliculas';
import Salas from '../../../interfaces/salas';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { Router } from '@angular/router';
import { dateTimeValidator } from '../../../validators/date-time.validator';
import { parseDateTime, toDDMMYYYYHHmm } from '../../../utils/parse_date';
import { ErrorRequerido } from '../../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../../components/ui/error-maxlenght/error-maxlenght';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { fechaFuturaValidator, fechaHoraFuturaValidator } from '../../../validators/fecha-futura.validator';


@Component({
  imports: [ReactiveFormsModule, CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, NavbarComponent],
  selector: 'app-funciones',
  styleUrl: './funciones.css',
  templateUrl: './funciones.html',
})
export class FuncionesAdmin {
  logo_menus = "/assets/imagenes/Gemini2.png"
  bd = inject(FuncionService);
  peliculasBd = inject(PeliculaService);
  salasBd = inject(SalaService);
  auth = inject(Auth);
  router = inject(Router);
  error = signal('');
  Guardando = signal(false);
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

  async volver() {
    this.router.navigate(['/home']);
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
    inicio: new FormControl('', [Validators.required, dateTimeValidator, fechaHoraFuturaValidator]),
    formato: new FormControl('2D', [Validators.required]),
    idioma: new FormControl('castellano', [Validators.required]),
    precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1) , Validators.max(99999)]),
    precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1) , Validators.max(99999)]),
    es_preventa: new FormControl(false),
  });

  async crear_funcion(): Promise<void> {
  this.error.set('');
  if (this.form_crear.invalid) return;

  const v = this.form_crear.value;
  const pelicula = this.peliculas().find(p => p.id === v.pelicula_id);
  if (!pelicula) {
    this.error.set('Seleccioná una película válida');
    return;
  }

  const inicio = parseDateTime(v.inicio ?? '');
  if (!inicio) {
    this.error.set('Fecha y hora inválidas');
    return;
  }

  const fin = new Date(inicio.getTime() + pelicula.duracion_min * 60000);

  this.Guardando.set(true);
  try {
    const nuevaFuncion: FuncionPorCrear = {
      pelicula_id: v.pelicula_id!,
      sala_id: v.sala_id!,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      formato: v.formato!,
      idioma: v.idioma!,
      precio_base: v.precio_base!,
      precio_vip: v.precio_vip!,
      es_preventa: v.es_preventa!,
    };

    await this.bd.crear_funcion(nuevaFuncion);
    this.form_crear.reset({ formato: '2D', idioma: 'castellano', es_preventa: false });
    await this.traer_funciones();
  } catch  {
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
      inicio: new FormControl('', [Validators.required, dateTimeValidator, fechaHoraFuturaValidator]),
      formato: new FormControl('2D', [Validators.required]),
      idioma: new FormControl('castellano', [Validators.required]),
      precio_base: new FormControl<number | null>(null, [Validators.required, Validators.min(1) , Validators.max(99999)]),
      precio_vip: new FormControl<number | null>(null, [Validators.required, Validators.min(1) , Validators.max(99999)]),
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
        inicio: toDDMMYYYYHHmm(new Date(item.inicio)),
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

        const v = this.form_edicion.value;
        const pelicula = this.peliculas().find(p => p.id === v.pelicula_id);
        if (!pelicula) {
          this.error.set('Seleccioná una película válida');
          return;
        }

        const inicio = parseDateTime(v.inicio ?? '');
        if (!inicio) {
          this.error.set('Fecha y hora inválidas');
          return;
        }

        const fin = new Date(inicio.getTime() + pelicula.duracion_min * 60000);

        this.Guardando.set(true);
        try {
          const funcionModificada: FuncionPorModificar = {
            id: v.id!,
            pelicula_id: v.pelicula_id!,
            sala_id: v.sala_id!,
            inicio: inicio.toISOString(),
            fin: fin.toISOString(),
            formato: v.formato!,
            idioma: v.idioma!,
            precio_base: v.precio_base!,
            precio_vip: v.precio_vip!,
            es_preventa: v.es_preventa!,
          };

          await this.bd.modificar_funcion(funcionModificada);
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

