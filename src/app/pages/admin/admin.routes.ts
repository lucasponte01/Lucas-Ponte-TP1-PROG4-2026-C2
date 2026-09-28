import { Route } from "@angular/router";



export const instalarroute: Route[] = [
  {
    path: 'peliculas',
    loadComponent: () => import('./peliculas/peliculas').then(m => m.Peliculas)
  },
  {
    path: 'funciones',
    loadComponent: () => import('./funciones/funciones').then(m => m.Funciones)
  },
  {
    path: 'salas',
    loadComponent: () => import('./salas/salas').then(m => m.Salas)
  },
];