import { inject, Injectable, Service } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import { SupabaseService } from '../supabase.service';
import Salas, { type SalasPorCrear } from '../../interfaces/salas';
import Resenas, { ResenasPorCrear } from '../../interfaces/resenas';

@Injectable({ providedIn: 'root' })
export class Reseñas {
stg = inject(StorageService);
sup = inject(SupabaseService);
    
reseñas = this.sup.client.from('resenas');
    async mostrar_resenas(): Promise<any[]> {
        const { data, error } = await this.reseñas.select('*');
        if (error) {
            throw error;
        }
        return data as Resenas[];
    }
    
    async crear_resena(resena: ResenasPorCrear): Promise<void> {
        const { data: { user } } = await this.sup.Auth.getUser();
        if (!user) throw new Error('Tenés que estar logueado para dejar una reseña');

        const nuevaResena = {pelicula_id: resena.pelicula_id,estrellas: resena.estrellas,comentario: resena.comentario,usuario_id: user.id};

        const { error } = await this.reseñas.insert(nuevaResena);

        if (error) throw error;
        }
}


