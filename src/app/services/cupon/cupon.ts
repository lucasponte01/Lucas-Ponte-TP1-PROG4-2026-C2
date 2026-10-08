import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Auth } from '../auth';
import { Cupon, CuponPorCrear } from '../../interfaces/cupon';




@Injectable({
  providedIn: 'root'
})
export class CuponService {

  private supabase = inject(SupabaseService);
  private auth = inject(Auth);

  async buscarCupon(codigo: string): Promise<any> {
    const { data, error } = await this.supabase.client.from('cupones').select('*').eq('codigo', codigo.trim().toUpperCase()).eq('activo', true).maybeSingle();
    if (error) {
      throw new Error('Error al buscar el cupón');
    }

    if (!data) {
      throw new Error('El cupón no existe o está inactivo');
    }

    this.validarFechas(data);
    this.validarEdad(data);

    return data;
  }

  async obtenerTodosCupones(): Promise<any[]> {
    const { data, error } = await this.supabase.client
      .from('cupones')
      .select('*')
      .order('codigo');

    if (error) throw error;
    return data || [];
  }

  async crearCupon(cupon: CuponPorCrear): Promise<void> {

    const { data, error } = await this.supabase.client.from('cupones').insert(cupon).select().single();

    if (error) {
      console.error('Error creando cupón:', error);
      throw new Error('No se pudo crear el cupón');
    }

    return data;
  }

  async cambiarEstadoCupon(id: string,activo: boolean): Promise<void> {

    const { error } = await this.supabase.client.from('cupones').update({activo: activo}).eq('id', id);

    if (error) {
      console.error('Error cambiando estado:', error);
      throw new Error('No se pudo cambiar el estado del cupón');
    }
  }

  private validarFechas(cupon: Cupon): void {
    const hoy = new Date();
    if (cupon.fecha_inicio) {
      const inicio = new Date(cupon.fecha_inicio);
      if (hoy < inicio) {
        throw new Error('El cupón todavía no está disponible');
      }
    }
    if (cupon.fecha_fin) {
      const final = new Date(cupon.fecha_fin);

      if (hoy > final) {
        throw new Error('El cupón está vencido');
      }
    }
  }

  private validarEdad(cupon: Cupon): void {
    if (!cupon.edad_minima) {
      return;
    }
    const user = this.auth.usuarioActual();
    if (!user) {
      throw new Error('Debes iniciar sesión para utilizar este cupón');
    }
    const fechaNacimiento =
      user.user_metadata?.['fecha_nacimiento'];

    if (!fechaNacimiento) {
      throw new Error(
        'No se encontró la fecha de nacimiento del usuario'
      );
    }
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad =
      hoy.getFullYear() -
      fecha.getFullYear();
    const noCumplio =
      hoy.getMonth() < fecha.getMonth() ||
      (
        hoy.getMonth() === fecha.getMonth() &&
        hoy.getDate() < fecha.getDate()
      );

    if (noCumplio) {
      edad--;
    }

    if (edad < cupon.edad_minima) {
      throw new Error(
        `Este cupón es válido únicamente para usuarios de ${cupon.edad_minima} años o más`
      );
    }
  }

  calcularDescuento(
    cupon: Cupon,
    subtotal: number
  ): number {
    if (cupon.tipo === 'porcentaje') {
      return subtotal * (cupon.valor / 100);
    }
    if (cupon.tipo === 'fijo') {
      return Math.min(cupon.valor, subtotal);
    }
    return 0;
  }
}