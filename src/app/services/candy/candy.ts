import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Auth } from '../auth';
import CandyProducto, { CandyPorCrear, CandyPorModificar } from '../../interfaces/cady_productos';


@Injectable({ providedIn: 'root' })
export class CandyServise {
    auth = inject(Auth)
    sup = inject(SupabaseService)

    candy = this.sup.client.from('candy_productos')

    async mostrar_productos() {
        const { data, error } = await this.candy.select('*');
        if (error) {
            throw error;
        }
        return data as CandyProducto[];
    }
    
    async subirArchivo(file: File): Promise<string | null> {
        const ruta = `${Date.now()}.${file.type.split('/')[1]}`;
        const { error } = await this.sup.Stg.from('productos').upload(ruta, file);

        if (error) {
            console.error(error);
            return null;
        }

        const { data: urlData } = this.sup.Stg.from('productos').getPublicUrl(ruta);
        return urlData.publicUrl;
    }

    async crear_Producto(producto: CandyPorCrear): Promise<void> {
    
            const {data, error } = await this.candy.insert(producto);
    
            if (error) throw error;
            console.log(data,error);
    }

    async eliminar_producto(nombre: string):Promise<void>{
            const {data,error} = await this.candy.delete().eq('nombre', nombre);
        
            if(error){
                throw error;
            };
            console.log(data,error);
        }
        
    async modificar_producto(product: CandyPorModificar): Promise<void> {
    
        const { data, error } = await this.candy.update(product).eq('id', product.id);
    
        if (error) throw error;
    
        console.log(data,error);
    }
    

}
