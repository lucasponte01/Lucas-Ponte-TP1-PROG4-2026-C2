import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import { SupabaseService } from '../supabase.service';
import Salas, { type SalasPorCrear } from '../../interfaces/salas';

@Injectable({ providedIn: 'root' })
export class SalaService {
    stg = inject(StorageService);
    sup = inject(SupabaseService);

    salas = this.sup.client.from('salas');

    async mostrar_sala(): Promise<any[]> {
        const { data, error } = await this.salas.select('*');

        if (error) {
            throw error;
        }
        return data as Salas[];
    }

    

    async crear_sala(sala: SalasPorCrear): Promise<void> {
        const {data, error } = await this.salas.insert(sala);

        if (error) {
            throw error;
        }
        console.log(data,error);
    }

    async modificar_sala(sala:Salas){
            const {data,error} = await this.salas.update(sala).eq('id', sala.id);
    
            if (error) {
                throw error
            }
            console.log(data,error);
        }

    async eliminar_sala(nombre:string):Promise<void>{
        const {data ,error} = await this.salas.delete().eq('nombre' , nombre);
    
        if(error){
            throw error;
        };
        console.log(data,error);
    }
}