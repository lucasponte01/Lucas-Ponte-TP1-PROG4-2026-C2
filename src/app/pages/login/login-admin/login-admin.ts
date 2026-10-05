import { Component } from '@angular/core';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../../components/ui/error-requerido/error-requerido';
import { ErrorEmail } from '../../../components/ui/error-email/error-email';
import { ErrorMinlenght } from '../../../components/ui/error-minlenght/error-minlenght';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  imports: [CampoInput, ErrorRequerido, ErrorEmail, ErrorMinlenght  , ReactiveFormsModule],
  selector: 'app-login-admin',
  styleUrl: './login-admin.css',
  templateUrl: './login-admin.html',
})
export class LoginAdmin {

  logo = '/assets/imagenes/Gemini1r.png';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  form_login_admin = new FormGroup({
    email: new FormControl('' , [Validators.email , Validators.required]),
    contrasena: new FormControl('', [Validators.required , Validators.minLength(6)]),
  });
  
  async iniciarSesion_admin() {
    if (this.form_login_admin.invalid) return;

    const { email, contrasena } = this.form_login_admin.getRawValue();

    try {
      await this.auth.login({ email: email!, password: contrasena! });
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al iniciar sesión como admin:',error);
    }
  }    


  volver(){
    this.router.navigate(['/'])
  }

}
