import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Compra } from '../../interfaces/compras';
import { CompraEntrada } from '../../interfaces/compra_entrada';
import { CompraItemCandy } from '../../interfaces/compraCandy';
import { CarritoService } from '../carrito/carrito';


@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private supabase = inject(SupabaseService);
  carritoservise = inject(CarritoService)
  async crearCompra(compra: Compra): Promise<Compra> {
    const { data, error } = await this.supabase.client
      .from('compras')
      .insert(compra)
      .select()
      .single();

    if (error) {
      console.error('Error al crear compra:', error);
      throw error;
    }

    return data;
  }


  // =========================================
  // AGREGAR ENTRADA
  // =========================================

  async agregarEntrada(entrada: CompraEntrada): Promise<CompraEntrada> {

    const { data, error } = await this.supabase.client
      .from('compra_entradas')
      .insert(entrada)
      .select()
      .single();

    if (error) {
      console.error('Error al guardar entrada:', error);
      throw error;
    }

    return data;
  }


  // =========================================
  // AGREGAR CANDY
  // =========================================

  async agregarCandy(
    item: CompraItemCandy
  ): Promise<CompraItemCandy> {

    const { data, error } = await this.supabase.client
      .from('compra_items_candy')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error al guardar Candy:', error);
      throw error;
    }

    return data;
  }


  // =========================================
  // MARCAR COMPRA COMO PAGADA
  // =========================================

  async marcarComoPagada(compraId: string) {

    const { data, error } = await this.supabase.client
      .from('compras')
      .update({
        estado_pago: 'pagado'
      })
      .eq('id', compraId)
      .select()
      .single();

    if (error) {
      console.error('Error al marcar compra como pagada:', error);
      throw error;
    }

    return data;
  }


  // =========================================
  // OBTENER COMPRA POR ID
  // =========================================

  async obtenerCompra(compraId: string) {

    const { data, error } = await this.supabase.client
      .from('compras')
      .select('*')
      .eq('id', compraId)
      .single();

    if (error) {
      console.error('Error al obtener compra:', error);
      throw error;
    }

    return data;
  }



  async obtenerEntradas(compraId: string) {

    const { data, error } = await this.supabase.client
      .from('compra_entradas')
      .select('*')
      .eq('compra_id', compraId);

    if (error) {
      console.error('Error al obtener entradas:', error);
      throw error;
    }

    return data;
  }




  async obtenerCandy(compraId: string) {

    const { data, error } = await this.supabase.client
      .from('compra_items_candy')
      .select('*')
      .eq('compra_id', compraId);

    if (error) {
      console.error('Error al obtener Candy:', error);
      throw error;
    }

    return data;
  }

    async finalizarCompra(compra: Compra,entradas: CompraEntrada[],candy: CompraItemCandy[]) {
        const compraCreada = await this.crearCompra(compra);
        if (!compraCreada.id) {
            throw new Error('No se pudo obtener el ID de la compra');
        }

        for (const entrada of entradas) {
            await this.agregarEntrada({
            ...entrada,
            compra_id: compraCreada.id
            });
        }
      
        for (const item of candy) {
            await this.agregarCandy({
            ...item,
            compra_id: compraCreada.id
            });
        }
        
        const compraPagada = await this.marcarComoPagada(
            compraCreada.id
        );

        return compraPagada;
        }

      async validarCodigo(codigoCompra: string): Promise<{ success: boolean; message: string }> {
    
    const { data: compra, error } = await this.supabase.client
      .from('compras')
      .select('*, estado_pago')
      .eq('id', codigoCompra)
      .single();

    if (error || !compra) {
      return { success: false, message: 'Código de operación inválido o no encontrado.' };
    }

      if (compra.estado_pago === 'validado' || compra.estado_pago === 'entregado') {
      return { success: false, message: '¡Atención! Este QR ya fue utilizado y se encuentra invalidado.' };
    }
    
    if (compra.estado === 'pagado') {
      return { success: false, message: '¡La compra se encuentra pagada.' };
    }

    
    const { error: updateError } = await this.supabase.client
      .from('compras')
      .update({ estado_pago: 'pagado' })
      .eq('id', codigoCompra);

    if (updateError) {
      return { success: false, message: 'Error al actualizar el estado en el sistema.' };
    }

    return { success: true, message: 'Validación exitosa. ¡Acceso permitido!' };
  }



  async cancelarCompra(compraId: string, fechaFuncion: string, totalCompra: number) {
    if (!fechaFuncion) {
      alert('Fecha de función no válida.');
      return;
    }

    const confirmar = confirm('¿Estás seguro de cancelar esta compra? Se te acreditarán los puntos correspondientes en tu cuenta.');
    if (!confirmar) return;

    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) return;

      // 1. Actualizar la compra principal a 'cancelado'
      const { error: updateError } = await this.supabase.client
        .from('compras')
        .update({ estado_pago: 'cancelado' })
        .eq('id', compraId);

      if (updateError) throw updateError;

      // 2. Actualizar las entradas asociadas de forma segura (usando compra_id)
      await this.supabase.client
        .from('compra_entradas')
        .update({ estado: 'cancelado' })
        .eq('compra_id', compraId);

      // 3. Acreditar puntos al usuario por la cancelación
      await this.carritoservise.registrarPuntosPorCompra(user.id, compraId, totalCompra);

      alert('Compra cancelada con éxito. Los puntos han sido acreditados a tu cuenta.');
      return true;
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      alert('Hubo un error al procesar la cancelación.');
      return false;
    }
  }
}