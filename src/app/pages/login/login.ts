import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  logo = '/assets/imagenes/Gemini1r.png';

  constructor(private router: Router) {}

  form_login = new FormGroup({
    email: new FormControl('' , Validators.email),
    contrasena: new FormControl('', Validators.required),
  });

  
  get email() {
    return this.form_login.get('email');
  }
  get contraseña() {
    return this.form_login.get('contrasena');
  }
  
  iniciar_sesion(){
    this.router.navigate(["./home"]);
  }
  acceso_invitado(){
    this.router.navigate(["./home"]);
  }
}
