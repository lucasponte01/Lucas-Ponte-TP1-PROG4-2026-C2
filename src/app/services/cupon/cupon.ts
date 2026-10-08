import { Injectable, inject } from '@angular/core';
import { ButacaService } from '../../services/butacas/butacas';

@Injectable({
  providedIn: 'root'
})
export class CuponService {
  private butacaService = inject(ButacaService);

  // Método para calcular la edad exacta a partir de la fecha de nacimiento
  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  async validarYAplicarCupon(usuarioId: string, codigoIngresado?: string) {
    try {
      // 1. Obtener datos del usuario (incluyendo su fecha de nacimiento y compras previas)
      const { data: perfil, error: errorPerfil } = await this.butacaService.sup.client
        .from('perfiles') // o la tabla de usuarios donde tengas la fecha de nacimiento
        .select('fecha_nacimiento')
        .eq('id', usuarioId)
        .single();

      if (errorPerfil) throw errorPerfil;

      const edadUsuario = perfil?.fecha_nacimiento ? this.calcularEdad(perfil.fecha_nacimiento) : 0;

      // 2. Verificar historial de compras para saber si es su primera compra
      const { data: compras } = await this.butacaService.sup.client
        .from('reservas')
        .select('id')
        .eq('usuario_id', usuarioId);

      const esPrimeraCompra = !compras || compras.length === 0;

      // 3. Buscar cupones activos y vigentes en Supabase
      const fechaActual = new Date().toISOString();
      let query = this.butacaService.sup.client
        .from('cupones')
        .select('*')
        .eq('activo', true)
        .lte('fecha_inicio', fechaActual)
        .gte('fecha_fin', fechaActual);

      // Si el usuario ingresó un código específico, lo buscamos; si no, buscamos el automático de primera compra
      if (codigoIngresado) {
        query = query.eq('codigo', codigoIngresado);
      } else {
        query = query.eq('soloprimera_compra', true);
      }

      const { data: cupones, error: errorCupon } = await query;

      if (errorCupon || !cupones || cupones.length === 0) {
        return { valido: false, mensaje: 'Cupón no válido o expirado.' };
      }

      const cupon = cupones[0];

      // 4. Validar restricciones de segmentación
      // Validar si es exclusivo de primera compra y el usuario ya compró
      if (cupon.soloprimera_compra && !esPrimeraCompra) {
        return { valido: false, mensaje: 'Este cupón es exclusivo para la primera compra.' };
      }

      // Validar restricción de edad mínima (Segmentación por ej: +50 años)
      if (cupon.edad_minima && edadUsuario < cupon.edad_minima) {
        return { 
          valido: false, 
          mensaje: `Este cupón requiere una edad mínima de ${cupon.edad_minima} años.` 
        };
      }

      return {
        valido: true,
        codigo: cupon.codigo,
        tipo: cupon.tipo,   
        valor: cupon.valor  
      };

    } catch (error) {
      console.error('Error al validar cupón segmentado:', error);
      return { valido: false, mensaje: 'Error al procesar el cupón.' };
    }
  }
}