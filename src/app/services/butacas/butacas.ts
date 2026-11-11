
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

  async mostrar_ocupadas(funcion_id: string): Promise<string[]> {
    const { data, error } = await this.sup.client
      .from('butacas_ocupadas')
      .select('butaca_id')
      .eq('funcion_id', funcion_id);

    if (error) throw error;

    const ids: string[] = [];
    for (const fila of data ?? []) {
      ids.push(fila.butaca_id);
    }
    return ids;
  }

  async reservar_butacas(funcion_id: string, butaca_ids: string[]): Promise<void> {
    const filas = [];
    for (const butaca_id of butaca_ids) {
      filas.push({ funcion_id, butaca_id });
    }

    const { error } = await this.sup.client.from('reservas_temporales').insert(filas);
    if (error) throw error;
  }
}