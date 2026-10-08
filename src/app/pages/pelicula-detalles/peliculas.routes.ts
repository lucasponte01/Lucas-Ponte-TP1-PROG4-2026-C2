import { Route } from "@angular/router";
import { authGuard } from "../guard/auth-guard";



export const homeroute: Route[] = [
  {
    path: 'peliculas_detalle',
    loadComponent: () => import('./slector-pelicula/slector-pelicula').then(m => m.SlectorPelicula),
   
  },//poner can para la ruta
  {
    path: 'butacas',
    loadComponent: () => import('./selector-butacas/butacas').then(m => m.SeleccionButacas)
  },
  {
    path: 'candy',
    loadComponent: () => import('./selector-candy/candy').then(m => m.Candy)
  }
];