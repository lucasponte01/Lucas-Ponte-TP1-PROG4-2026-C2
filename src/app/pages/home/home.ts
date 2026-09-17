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

//visual del home poner que los botones se opaquen cuando pasas x arriba
//mirar requerimientos :
/*
3.1 Catálogo de películas
RF-01: Cada película tiene nombre, imagen, sinopsis, duración, uno o más géneros, formato (2D/3D/4D/5D) e idioma (castellano/subtitulada).
RF-02: Listado de películas con buscador, filtrable por género (múltiple).
RF-03: La home muestra primero las 3 películas más vendidas.
RF-04: Sección "Próximamente" con películas de estreno futuro; el usuario puede activar una alerta para ser notificado cuando se habilite la venta.
RF-05: Preventa configurable por película: se abre 7 días antes del estreno con un % de descuento configurable sobre el precio normal; al llegar la fecha de estreno, el precio vuelve al valor normal automáticamente.
RF-06: Cada película puede tener restricción de edad (18+, 13+, sin restricción). Usuarios por debajo de la edad no pueden comprar esa entrada; toda entrada de una película con restricción debe indicar que debe asistir un adulto.
*/
export class Home {
  logo_menus = "/assets/imagenes/Gemini2.png"
  auth = inject(Auth)
  route = inject(Router)

  async cerrar_sesion() {
  try {
    await this.auth.cerrarSesion();
    
  } catch (error) {
    console.error(error);
  }
}
}
