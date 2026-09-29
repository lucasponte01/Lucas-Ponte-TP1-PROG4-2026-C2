import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from '../storage/storage-service';
import Pelicula, { type PeliculaPorCrear } from '../../../app/interfaces/peliculas';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class PeliculasServices {
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

    async subirPelicula(file: File): Promise<string | null> {
        const extension = file.type.split('/')[1];
        const ruta = `${crypto.randomUUID()}.${extension}`;

        const { error } = await this.sup.Stg.from('Peliculas').upload(ruta, file);

        if (error) {
            console.error(error);
            return null;
        }

        return this.sup.Stg.from('Peliculas').getPublicUrl(ruta).data.publicUrl;
    }

    async crear_pelicula(pelicula: PeliculaPorCrear, imagen: File): Promise<void> {
        const imagen_url = await this.subirPelicula(imagen);
        if (!imagen_url) throw new Error('Error al subir la imagen');

        const { error } = await this.sup.client.from('peliculas').insert({
            ...pelicula,
            imagen_url
        });

        if (error) throw error;
    }

    

    async eliminar_pelicula(id: string):Promise<void>{
        const {data,error} = await this.peliculas.delete().eq('id', id);
    
        if(error){
            throw error;
        };
        
    }

    rutaDesdeUrl(url: string | null | undefined): string | null {
        if (!url) return null;

        const marca = '/Peliculas/';
        const indice = url.indexOf(marca);
        if (indice === -1) return null;

        return decodeURIComponent(url.substring(indice + marca.length));
    }

    async modificar_pelicula(original: Pelicula, cambios: PeliculaPorCrear, nuevaImagen: File | null): Promise<void> {
        let imagen_url = original.imagen_url;

        if (nuevaImagen) {
            const urlNueva = await this.subirPelicula(nuevaImagen);
            if (!urlNueva) throw new Error('Error al subir la imagen');
            imagen_url = urlNueva;
        }

        const { data, error } = await this.peliculas
            .update({ ...cambios, imagen_url })
            .eq('id', original.id)
            .select('id');

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No se modificó ninguna película');

        if (nuevaImagen) {
            const rutaVieja = this.rutaDesdeUrl(original.imagen_url);
            if (rutaVieja) {
            const { error: errorStorage } = await this.sup.Stg.from('Peliculas').remove([rutaVieja]);
            if (errorStorage) console.error(errorStorage);
            }
        }
    }

}    

