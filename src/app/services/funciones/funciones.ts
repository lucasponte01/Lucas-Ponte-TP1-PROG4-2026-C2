import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import {Funcion, FuncionPorCrear, FuncionPorModificar} from '../../../app/interfaces/funcion'
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class FuncionService {
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

    async mostrar_funcion_por_id(id: string): Promise<Funcion> {
        const { data, error } = await this.funciones.select('*, salas(nombre)').eq('id', id).single();
         if (error) throw error;
        return data as Funcion;
    }
    
    async crear_funcion(funcion: FuncionPorCrear):Promise<void>{
        const {data, error } = await this.funciones.insert(funcion)
        
        if (error) {
            throw error
        }
        console.log(data,error);
    }


    async eliminar_funcion(id:string):Promise<void>{
        const {data, error} = await this.funciones.delete().eq('id' , id);
    
        if(error){
            throw error;
        };
        console.log(data,error);
    }

    async modificar_funcion(funcion: FuncionPorModificar){
        const {data, error} = await this.funciones.update(funcion).eq('id', funcion.id);

        if (error) {
            throw error
        }
        console.log(data,error);
    }

}