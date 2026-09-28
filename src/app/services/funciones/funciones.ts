import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from '../storage/storage-service';
import {Funcion} from '../../../app/interfaces/funcion'
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class Funciones {
    stg = inject(StorageService);
    sup = inject(SupabaseService)
    
    funciones = this.sup.client.from('funciones');

    async mostrarfuncin(): Promise<any[]> {
        const { data, error } = await this.funciones.select('*')

        if (error) {
            throw error;
        }


        return data as Funcion[];
        


    }

    

}