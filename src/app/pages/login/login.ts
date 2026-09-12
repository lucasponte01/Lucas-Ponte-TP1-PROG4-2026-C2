import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { CampoInput } from '../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../components/ui/error-requerido/error-requerido';
import { ErrorEmail } from '../../components/ui/error-email/error-email';
import { ErrorMinlenght } from '../../components/ui/error-minlenght/error-minlenght';

@Component({
  imports: [ReactiveFormsModule, RouterLink, CampoInput, ErrorRequerido, ErrorEmail, ErrorMinlenght],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  logo = '/assets/imagenes/Gemini1r.png';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  form_login = new FormGroup({
    email: new FormControl('' , Validators.email),
    contrasena: new FormControl('', [Validators.required , Validators.minLength(6)]),
  });
  
  async iniciarSesion() {
    if (this.form_login.invalid) return;

    const { email, contrasena } = this.form_login.getRawValue();

    try {
      await this.auth.logear({ email: email!, password: contrasena! });
      this.router.navigate(['/home']);
    } catch (error) {
      console.error(error);
    }
  }    
      

  acceso_invitado(){
    this.router.navigate(["./home"]);
  }
}
