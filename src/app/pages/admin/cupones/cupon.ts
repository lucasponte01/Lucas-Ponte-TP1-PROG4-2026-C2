import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';
import { CandyServise } from '../../../services/candy/candy';
import { CuponPorCrear } from '../../../interfaces/cupon';
import { CuponService } from '../../../services/cupon/cupon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../../components/ui/error-minlenght/error-minlenght';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { parseDate, toISODateOnly } from '../../../utils/parse_date';
import { dateTimeValidator } from '../../../validators/date-time.validator';
import { dateValidator } from '../../../validators/date.validator';

@Component({
  imports: [ReactiveFormsModule, CampoInput, ErrorRequerido, ErrorMinlenght, NavbarComponent],
  selector: 'app-cupon',
  styleUrl: './cupon.css',
  templateUrl: './cupon.html',
})
export class Cupon {
  logo_menus = "/assets/imagenes/Gemini2.png"
  cuponServise = inject(CuponService)
  auth = inject(Auth);
  private fb = inject(FormBuilder);
  error = signal('');
  router = inject(Router);
  cargando = signal(false);
  err = signal('');
  vistaActiva = signal<string>('crear');
  cuponesListados = signal<any[]>([]);

  cambiarVista(vista: string) {
    this.vistaActiva.set(vista);
    this.cargarTodosLosCupones();
  }

  async cargarTodosLosCupones() {
    this.cargando.set(true);
    try {
      const data = await this.cuponServise.obtenerTodosCupones();
      this.cuponesListados.set(data);
    } catch (error) {
      console.error('Error al cargar la lista de cupones:', error);
      this.err.set('No se pudieron cargar los cupones.');
    } finally {
      this.cargando.set(false);
    }
  }

  //crear cupon 
  cuponForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['porcentaje', [Validators.required]],
    valor: [0, [Validators.required, Validators.min(1)]],
    edad_minima: [null, [Validators.min(0), Validators.max(120)]],
    solo_primera_compra: [false],
    activo: [true],
    fecha_inicio: ['', [Validators.required ,dateValidator]],
    fecha_fin: ['', [Validators.required ,dateValidator ]]
  });

  async crear_Cupon(){


    if (this.cuponForm.invalid) {
      return;
    }

    this.cargando.set(true);
    try{

      const formValues = this.cuponForm.value;
      
      const fechaInicioParsed = parseDate(formValues.fecha_inicio); 
      const fechaFinalParsed = parseDate(formValues.fecha_fin);

      if (!fechaInicioParsed || !fechaFinalParsed) {
        this.err.set('Formato de fecha inválido. Utiliza DD/MM/YYYY');
        this.cargando.set(false);
        return;
      }

      const nuevocupon :CuponPorCrear = {
        codigo:formValues.codigo.toUpperCase().trim(),
        tipo: formValues.tipo,
        valor: formValues.valor,
        edad_minima: formValues.edad_minima,
        solo_primera_compra: formValues.solo_primera_compra,
        activo: Boolean(formValues.activo),
        fecha_inicio: toISODateOnly(fechaInicioParsed),
        fecha_fin: toISODateOnly(fechaFinalParsed)
      }
      await this.cuponServise.crearCupon(nuevocupon);
      this.cuponForm.reset();
    }catch (error){
      console.error('Error al crear cupón:', error);
      this.err.set('Ocurrió un error al guardar el cupón en la base de datos.');
    }finally {
      this.cargando.set(false);
    }
  }
  //desactivar cupon
  async cambiarEstado(id: string, activoActual: boolean) {

    try {
      // Invertimos el estado actual (si está activo lo pasamos a false y viceversa)
      const nuevoEstado = !activoActual;
      await this.cuponServise.cambiarEstadoCupon(id, nuevoEstado);

      await this.cargarTodosLosCupones(); // Recargamos la lista
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.err.set('Ocurrió un error al actualizar el estado del cupón.');
    }
  }
}
