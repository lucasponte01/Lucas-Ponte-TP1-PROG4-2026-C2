import { Timestamp } from 'rxjs';
export default interface ComboProducto {
    id: string;
    nombre: string;
    descripcion: string;
    precio:number;
    productos_ids : string[];
    foto:string;
    destacado:boolean;
    activo:boolean;
    created_at: Timestamp<any>;
    
}

export interface ComboPorCrear{
    nombre: string;
    descripcion: string;
    precio:number;
    productos_ids : string[];
    foto:string;
    destacado:boolean; 
    
}
