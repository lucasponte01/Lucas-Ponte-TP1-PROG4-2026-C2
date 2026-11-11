import { Component, inject, signal } from '@angular/core';
import {  FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../components/ui/error-pattern/error-pattern';
import { ErrorEmail } from '../../components/ui/error-email/error-email';
import { Auth } from '../../services/auth';
import Usuario from '../../interfaces/usuario';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { StorageService } from '../../services/storage/storage-service';
import { EdadPipe } from '../../components/ui/pipe/pipe-edad';
import { fechaNacimientoValidator } from '../../validators/fecha-nacimiento.validator';


@Component({
  imports: [ReactiveFormsModule, CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, ErrorPattern, ErrorEmail, RouterLink, EdadPipe],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  auth = inject(Auth)
  rout = inject(Router)
  stg = inject(StorageService)

  logo_2='assets/imagenes/Gemini1r.png'
  
  avatares = signal<string[]>([]);
  avatarSeleccionado = signal<string | null>(null);
  mostrarSelectorAvatar = signal(false);
  cargando_Avatares = signal(false);

  errores = signal("")

  form_registro = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2) , Validators.maxLength(15) , Validators.pattern(/^[a-zA-Z\- ]+$/)]),
    email: new FormControl('', [Validators.email , Validators.required]),
    contrasena: new FormControl('',[Validators.required , Validators.minLength(6)]),
    fecha_nacimiento: new FormControl('', [Validators.required, fechaNacimientoValidator]),
    tipo_sangre: new FormControl('', [Validators.required]),
    color_ojos: new FormControl('', [Validators.required]),
    dias_vacaciones: new FormControl<number | null>(null, [Validators.required, Validators.min(1) ,Validators.max(365) ]),
    foto: new FormControl<string | null>(null,)
  });

 

  async registrarse(){
    if (this.form_registro.invalid) {
      this.form_registro.markAllAsTouched();
      return;
    }

    this.errores.set("");

    try {
      // Si registrar es una promesa, debe llevar await para que el catch la atrape
      await this.auth.registrar(this.form_registro.value as Usuario);
      this.rout.navigate(['/home']); // O a donde quieras redirigir tras registrar
    } catch (error: any) {
       this.errores.set(error instanceof Error ? error.message : String(error));
    }
  }

async abrirSelectorAvatar(): Promise<void> {
  this.mostrarSelectorAvatar.set(true);
  this.cargando_Avatares.set(true);
  this.errores.set("")

  try {
    this.errores.set("")
      const avatares = await this.stg.listarAvatares();
      this.avatares.set(avatares);
    } catch (error) {
      this.errores.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.cargando_Avatares.set(false);
    } 
  } 

  elegirAvatar(url: string): void {
    this.avatarSeleccionado.set(url);
  }

  confirmarAvatar(): void {
    this.form_registro.controls.foto.setValue(this.avatarSeleccionado());
    this.mostrarSelectorAvatar.set(false);
  }
  volver(){
    this.rout.navigate(['/'])
  }

}


