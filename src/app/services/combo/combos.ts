import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Auth } from '../auth';
import ComboProducto, { ComboPorCrear } from '../../interfaces/combos';


@Injectable({ providedIn: 'root' })
export class ComboServise {
    auth = inject(Auth)
    sup = inject(SupabaseService)

    combos = this.sup.client.from('combos')
    async obtenerCombos() {
        const { data, error } = await this.combos.select('*').eq('activo', true).order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data as ComboProducto[];
  }

  async crearCombo(combo: ComboPorCrear): Promise<void> {
    const { error } = await this.combos.insert(combo);

    if (error) {
      console.error('Error al crear el combo:', error);
      throw error;
    }
  }
  async desactivarCombo(idCombo: string): Promise<void> {
    const { error } = await this.combos.update({ activo: false }).eq('id', idCombo);

    if (error) {
      console.error('Error al dar de baja el combo:', error);
      throw error;
    }
  }
  async ActivarCombo(idCombo: string): Promise<void> {
    const { error } = await this.combos.update({ activo: true }).eq('id', idCombo);

    if (error) {
      console.error('Error al dar de alta el combo:', error);
      throw error;
    }
  }
}