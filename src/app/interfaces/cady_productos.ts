export default interface CandyProducto {
  id: string;
  nombre: string;
  precio:number;
  activo:boolean;
  categorias:string[];
  foto:string
}

export interface CandyPorCrear {
  nombre: string;
  precio:number;
  categorias:string[];
  foto:string
}

export interface CandyPorModificar {
  id:string;
  nombre: string;
  precio:number;
  categorias:string[];
  foto:string
}

