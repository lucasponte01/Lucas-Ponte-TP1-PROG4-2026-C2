import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Auth } from '../../services/auth';
// Asegúrate de importar tu servicio de compras
import { DatePipe, CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/ui/navbar/navbar';
import { CompraService } from '../../services/compra/compra';

@Component({
  imports: [DatePipe, NavbarComponent, CommonModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private supabase = inject(SupabaseService);
  private auth = inject(Auth);
  private compraService = inject(CompraService);

  logo_menus = "/assets/imagenes/Gemini2.png";
  
  nombreUsuario = signal<string>('');
  emailUsuario = signal<string>('');
  avatarUsuario = signal<string>('');

  historialPuntos = signal<any[]>([]);
  puntosTotales = signal<number>(0);
  comprasUsuario = signal<any[]>([]);

  async ngOnInit() {
    await this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    const { data: { user }, error } = await this.supabase.client.auth.getUser();
    
    if (error || !user) return;

    const metadata = user.user_metadata;
    if (metadata) {
      const nombreCompleto = `${metadata['nombre'] || ''} ${metadata['apellido'] || ''}`.trim();
      this.nombreUsuario.set(nombreCompleto || 'Usuario');
      // Corregido para que apunte a la ruta correcta sin error 404
      this.avatarUsuario.set(metadata['avatar_url'] || '/assets/imagenes/noavatar.jpg');
    }
    this.emailUsuario.set(user.email || '');

    // Cargar historial de puntos
    const dataPuntos = await this.auth.consultarhistorial_de_peliculas();
    if (dataPuntos) {
      this.historialPuntos.set(dataPuntos);
      const total = this.calcularPuntosTotales(dataPuntos);
      this.puntosTotales.set(total);
    }

    // Cargar historial de películas
    await this.cargarHistorialPeliculas();
  }

  async cargarHistorialPeliculas() {
    try {
      const compras = await this.auth.consultarhistorial_de_peliculas();
      this.comprasUsuario.set(compras || []);
    } catch (error) {
      console.error('Error al cargar historial de películas:', error);
    }
  }

  // Valida si faltan más de 2 horas para la función (RF-16)
  puedeCancelar(fechaFuncion: string): boolean {
    if (!fechaFuncion) return false;
    const ahora = new Date().getTime();
    const inicioFuncion = new Date(fechaFuncion).getTime();
    const diferenciaHoras = (inicioFuncion - ahora) / (1000 * 60 * 60);
    return diferenciaHoras >= 2;
  }

  // Método que llama el botón de la vista
  async cancelarCompra(compraId: string, fechaFuncion: string, totalCompra: number) {
    if (!this.puedeCancelar(fechaFuncion)) {
      alert('Ya no es posible cancelar esta compra (faltan menos de 2 horas para la función).');
      return;
    }

    const exito = await this.compraService.cancelarCompra(compraId, fechaFuncion, totalCompra);
    if (exito) {
      
      await this.cargarDatosUsuario();
    }
  }

  calcularPuntosTotales(movimientos: any[]): number {
    return movimientos.reduce((acc, mov) => {
      if (mov.tipo === 'ganado' || mov.tipo === 'sumar') {
        return acc + mov.cantidad;
      } else if (mov.tipo === 'canje' || mov.tipo === 'gastar') {
        return acc - mov.cantidad;
      }
      return acc;
    }, 0);
  }
}