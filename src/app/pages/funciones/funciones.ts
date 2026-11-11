import { Component, inject, Pipe, Signal, signal } from '@angular/core';
import { NavbarComponent } from '../../components/ui/navbar/navbar';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionService } from '../../services/funciones/funciones';
import { pipe } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  imports: [NavbarComponent , DatePipe],
  selector: 'app-funciones',
  styleUrl: './funciones.css',
  templateUrl: './funciones.html',
})
export class Funciones{
  logo_menus = "/assets/imagenes/Gemini2.png"
  private route = inject(ActivatedRoute);
  private funcionService = inject(FuncionService);

  pelicula = signal<string | undefined>(undefined)
  funciones = signal<any>(undefined);
  cargando = signal(true);

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      const peliculaId = params['peliculaId'] as string | undefined;
      this.pelicula.set(peliculaId);
      
      if (peliculaId) {
        this.mostrar_pelicula(peliculaId);
      } else {
        this.cargando.set(false);
        
      }
    });
  }
  
  async mostrar_pelicula(peliculaId: string) {
    try {
      this.cargando.set(true);
      this.funciones.set(await this.funcionService.mostrar_funcion_por_id(peliculaId)) 
    } catch (error) {
      console.error('Error al cargar las funciones:', error);
    } finally {
      this.cargando.set(false);
    }
  }
}
