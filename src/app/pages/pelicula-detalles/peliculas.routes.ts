import { Route } from "@angular/router";
import { authGuard } from "../guard/auth-guard";



export const homeroute: Route[] = [
  {
    path: 'peliculas_detalle',
    loadComponent: () => import('./slector-pelicula/slector-pelicula').then(m => m.SlectorPelicula),
   
  }//poner can para la ruta
];