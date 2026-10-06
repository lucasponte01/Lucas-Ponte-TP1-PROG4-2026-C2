import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import Pelicula, { PeliculaPorCrear, PeliculaPorModificar } from '../../../app/interfaces/peliculas';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class PeliculaService {
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

    async mostrar_pelicula_id(peliculaId: string): Promise<{ pelicula: any; funciones: any[]; resenas: any[] }> {
            const {data:pelicula, error:errorpelicula} = await this.peliculas.select('*').eq('id' , peliculaId).single();

            if(errorpelicula){
                throw errorpelicula;
            }

            if (!pelicula) {
                    throw new Error('No se encontró la película');
                }

            if (pelicula.imagen) {
                const { data: urlData } = this.sup.client.storage
                .from('Peliculas')
                .getPublicUrl(pelicula.imagen);

                if (urlData) {
                pelicula.imagen = urlData.publicUrl;
                }
            }    
            
            const {data:funciones, error:errorfuncion} = await this.sup.client.from('funciones').select('* , salas (*)').eq('pelicula_id' , peliculaId);

            if(errorfuncion){
                throw errorfuncion;
            }

            const {data:resenas , error:errorresenas} = await this.sup.client.from('resenas').select('*').eq('pelicula_id' , peliculaId);

            if(errorresenas){
                throw errorresenas;
            }

            return { pelicula, funciones: funciones || [], resenas: resenas || [] };
        }

    async subirArchivo(file: File): Promise<string | null> {
        const ruta = `${Date.now()}.${file.type.split('/')[1]}`;
        const { error } = await this.sup.Stg.from('Peliculas').upload(ruta, file);

        if (error) {
            console.error(error);
            return null;
        }

        const { data: urlData } = this.sup.Stg.from('Peliculas').getPublicUrl(ruta);
        return urlData.publicUrl;
    }

    async crear_pelicula(pelicula: PeliculaPorCrear): Promise<void> {

        const {data, error } = await this.sup.client.from('peliculas').insert(pelicula);

        if (error) throw error;
        console.log(data,error);
    }

    async eliminar_pelicula(nombre: string):Promise<void>{
        const {data,error} = await this.peliculas.delete().eq('nombre', nombre);
    
        if(error){
            throw error;
        };
        console.log(data,error);
    }
    
    async modificar_pelicula(pelicula: PeliculaPorModificar): Promise<void> {

        const { data, error } = await this.peliculas.update(pelicula).eq('id', pelicula.id);

        if (error) throw error;

        console.log(data,error);
    }

}    

