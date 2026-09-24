import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import {Pelicula} from '../../../app/interfaces/peliculas'
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class Peliculas {
    stg = inject(StorageService);
    sup = inject(SupabaseService)
    
    peliculas = this.sup.client.from('peliculas');

    async mostrarpeliculas(): Promise<any[]> {
        const { data, error } = await this.peliculas.select('*')

        if (error) {
            throw error;
        }


        return data as Pelicula[];
    
    }
    
    

}
