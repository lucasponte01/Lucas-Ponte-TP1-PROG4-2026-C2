import { inject, Injectable, Service } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import { SupabaseService } from '../supabase.service';
import Salas, { type SalasPorCrear } from '../../interfaces/salas';
import Resenas, { ResenasPorCrear } from '../../interfaces/resenas';

@Injectable()
export class Reseñas {
stg = inject(StorageService);
sup = inject(SupabaseService);
    
salas = this.sup.client.from('resenas');
    
    async mostrar_resenas(): Promise<any[]> {
            const { data, error } = await this.salas.select('*');
    
            if (error) {
                throw error;
            }
            return data as Resenas[];
        }
    
        
    
    async crear_resena(resena: ResenasPorCrear): Promise<void> {
        const { data: { user } } = await this.sup.Auth.getUser();
        if (!user) throw new Error('Tenés que estar logueado para dejar una reseña');

        const { error } = await this.sup.client.from('resenas').insert(resena);

        if (error) throw error;
        }
    
}


