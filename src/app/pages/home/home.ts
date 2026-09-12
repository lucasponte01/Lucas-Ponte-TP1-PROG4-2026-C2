import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [RouterLink , ReactiveFormsModule],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth)
  route = inject(Router)



  async cerrar_sesion() {
  try {
    await this.auth.cerrarSesion();
    await this.route.navigate(['/']); 
  } catch (error) {
    console.error(error);
  }
}
}
