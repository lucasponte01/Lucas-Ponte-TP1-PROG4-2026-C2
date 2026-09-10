import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../components/ui/error-pattern/error-pattern';
import { ErrorEmail } from '../../components/ui/error-email/error-email';
import { Auth } from '../../services/auth';
import Usuario from '../../../../interfaces/usuario';

@Component({
  imports: [ReactiveFormsModule, CampoInput , ErrorRequerido , ErrorMinlenght , ErrorMaxlenght , ErrorPattern , ErrorEmail],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
//mejorar diseño 
  auth = inject(Auth)


  logo_2='assets/imagenes/Gemini2.png'

  form_registro = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    email: new FormControl('', [Validators.email , Validators.required]),
    contrasena: new FormControl('',[Validators.required , Validators.minLength(6)]),
    edad: new FormControl<number | null>(null, [Validators.required, Validators.min(15), Validators.max(120), Validators.pattern(/^[0-9]+$/)]),
    foto: new FormControl<File | null>(null,)
  });

  registrarse(){
    if(this.form_registro.valid){
      this.auth.registrar(this.form_registro.value as unknown as Usuario)
    }
  }

}


export function fechaNacimientoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const fechaNac = new Date(control.value);
    const hoy = new Date();
    
    const anioMinimo = hoy.getFullYear() - 120;

    if (fechaNac > hoy) {
      return { fechaFutura: true }; 
    }
    if (fechaNac.getFullYear() < anioMinimo) {
      return { fechaMuyAntigua: true }; 
    }
    return null;
  };

  
}

const fechaValidators = [
  Validators.required,
  fechaNacimientoValidator()
];
