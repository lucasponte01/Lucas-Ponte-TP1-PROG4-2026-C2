import { Component, inject, signal } from '@angular/core';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../../components/ui/error-pattern/error-pattern';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage/storage-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorEmail } from '../../../components/ui/error-email/error-email';

@Component({
  imports: [CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, ErrorPattern, ReactiveFormsModule, ErrorEmail],
  selector: 'app-registro-anonimo',
  styleUrl: './registro-anonimo.css',
  templateUrl: './registro-anonimo.html',
})
export class RegistroAnonimo {
  auth = inject(Auth)
  rout = inject(Router)
  stg = inject(StorageService)

  nombre_form = signal<string>('')
  email_form = signal<string>('')

  logo_2='assets/imagenes/Gemini2.png'

   form_registro_anonimo = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    email: new FormControl('', [Validators.email , Validators.required]),
  });

  

  registrarse_anonimo():void{
    if(!this.form_registro_anonimo){
      return;
    }

    const{nombre , email} = this.form_registro_anonimo.getRawValue();
    this.auth.logear_anonimo(nombre! , email!)

    console.log("nombre y email registrados");
  }
  volver(){
    this.rout.navigate(['/'])
  }
  
}
