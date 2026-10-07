
import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import Butaca from '../../interfaces/butaca';

@Injectable({ providedIn: 'root' })
export class ButacaService {
  sup = inject(SupabaseService);

  canalButacas = this.sup.client.channel('cambios-butacas-sala');
  

  async mostrar_por_sala(sala_id: string): Promise<Butaca[]> {
    const { data, error } = await this.sup.client.from('butacas').select('*').eq('sala_id', sala_id).order('fila').order('numero');

    if (error) throw error;
    return data as Butaca[];
  }

  async mostrar_ocupadas(sala_id: string): Promise<string[]> {
    const { data, error } = await this.sup.client
      .from('butacas')
      .select('id')
      .eq('sala_id', sala_id)
      .eq('estado', 'ocupada');

    if (error) throw error;

    return (data ?? []).map(b=>  b.id);
  }

  async bloquearButacas(idsButacas: string[]) {
  const {data, error } = await this.sup.client.from('butacas').update({ estado: 'ocupada' }).in('id', idsButacas).select();

  if (error) throw error;

  return { data, error };
}
}