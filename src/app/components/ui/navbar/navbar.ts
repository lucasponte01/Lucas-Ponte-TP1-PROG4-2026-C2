import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  imports: [ CommonModule, RouterModule],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  auth = inject(Auth)
  router = inject(Router);
  @Input() logo_menus: string = '';
  async cerrar_sesion() {
    try {
      await this.auth.cerrarSesion();
      
    } catch (error) {
      console.error(error);
    }
  }

  async volver() {
    this.router.navigate(['/home']);
  }


  ngOnInit() {
    console.log('NavbarComponent initialized');
  }


 
}