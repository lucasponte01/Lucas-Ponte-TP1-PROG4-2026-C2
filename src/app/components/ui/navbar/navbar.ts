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
  router = inject(Router);
  

  @Input() logoSrc?: string;         
  @Output() onCambiarVista = new EventEmitter<string>();
  @Output() onVolver = new EventEmitter<string>();

  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }

  cambiarVista(vista: string) {
    this.onCambiarVista.emit(vista);
  }

  async volver(ruta:string){
    this.onVolver.emit(ruta);
    this.router.navigate([ruta]);
  }
}