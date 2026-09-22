import { Component, inject, signal } from '@angular/core';
import {  FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../components/ui/error-pattern/error-pattern';
import { ErrorEmail } from '../../components/ui/error-email/error-email';
import { Auth } from '../../services/auth';
import Usuario from '../../../../interfaces/usuario';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StorageService } from '../../services/storage-service';


@Component({
  imports: [ReactiveFormsModule, CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, ErrorPattern, ErrorEmail, RouterLink, RouterOutlet],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  auth = inject(Auth)
  rout = inject(Router)
  stg = inject(StorageService)

  logo_2='assets/imagenes/Gemini2.png'
  

  

  form_registro = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    email: new FormControl('', [Validators.email , Validators.required]),
    contrasena: new FormControl('',[Validators.required , Validators.minLength(6)]),
    edad: new FormControl<number | null>(null, [Validators.required, Validators.min(15), Validators.max(120), Validators.pattern(/^[0-9]+$/)]),
    tipo_sangre: new FormControl('', [Validators.required]),
    color_ojos: new FormControl('', [Validators.required]),
    dias_vacaciones: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    foto: new FormControl<string | null>(null,)
  });

 

  registrarse(){
    if(this.form_registro.valid){
      this.auth.registrar(this.form_registro.value as Usuario)
    }
  }


  avatares = signal<string[]>([]);
  avatarSeleccionado = signal<string | null>(null);
  mostrarSelectorAvatar = signal(false);
  isLoadingAvatares = signal(false);

async abrirSelectorAvatar(): Promise<void> {
  this.mostrarSelectorAvatar.set(true);
  this.isLoadingAvatares.set(true);

  try {
      const avatares = await this.stg.listarAvatares();
      this.avatares.set(avatares);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoadingAvatares.set(false);
    } 
  } 

  elegirAvatar(url: string): void {
    this.avatarSeleccionado.set(url);
  }

  confirmarAvatar(): void {
    this.form_registro.controls.foto.setValue(this.avatarSeleccionado());
    this.mostrarSelectorAvatar.set(false);
  }
  

}


