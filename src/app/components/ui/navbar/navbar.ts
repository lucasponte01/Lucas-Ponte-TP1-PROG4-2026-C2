import { Component, Input, Output, EventEmitter, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '',
  styles: []
})
export class NavbarComponent {

  auth = inject(Auth)

  constructor(private router: Router) {}

  @Input() logoSrc?: string;         

  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }

  async volver(ruta:string){
    this.router.navigate([ruta])
  }
}