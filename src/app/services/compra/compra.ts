import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Compra } from '../../interfaces/compras';
import { CompraEntrada } from '../../interfaces/compra_entrada';
import { CompraItemCandy } from '../../interfaces/compraCandy';


@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private supabase = inject(SupabaseService);

  // =========================================
  // CREAR COMPRA
  // =========================================

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
}