import { Timestamp } from "rxjs";

export default interface Resenas {
    id: string;
    usuario_id:string;
    pelicula_id:string;
    estrellas: number;
    comentario:string;
    creada_en: string;
}

export  interface ResenasPorCrear {
    pelicula_id?: string;
    estrellas: number;
    comentario:string;
}