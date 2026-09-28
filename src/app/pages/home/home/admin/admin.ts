import { Component, inject } from '@angular/core';
import { Auth } from '../../../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth)

  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }
}
