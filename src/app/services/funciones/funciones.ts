import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import {Funcion, FuncionPorCrear} from '../../../app/interfaces/funcion'
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class FuncionesService {
    stg = inject(StorageService);
    sup = inject(SupabaseService)
    
    funciones = this.sup.client.from('funciones');

    async mostrar_funcion(): Promise<any[]> {
        const { data, error } = await this.funciones.select('*')

        if (error) {
            throw error;
        }
        return data as Funcion[];

    }
    
    async crear_funcion(funcion: FuncionPorCrear):Promise<void>{
        const { error } = await this.funciones.insert({
            ...funcion
        })
        
        if (error) {
            throw error
        }
    }


    async eliminar_funcion(id:string):Promise<void>{
        const {error} = await this.funciones.delete().eq('id' , id);
    
        if(error){
            throw error;
        };
    
    }

    async modificar_funcion(id: string, funcion : FuncionPorCrear){
        const {error} = await this.funciones.update({
            funcion : funcion
        }).eq('id', id);

        if (error) {
            throw error
        }
        
    }

}