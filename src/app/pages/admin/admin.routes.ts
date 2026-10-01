import { Route } from "@angular/router";



export const instalarroute: Route[] = [
  {
    path: 'peliculas',
    loadComponent: () => import('./peliculas/peliculas').then(m => m.PeliculasAdmin)
  },
  {
    path: 'funciones',
    loadComponent: () => import('./funciones/funciones').then(m => m.FuncionesAdmin)
  },
  {
    path: 'salas',
    loadComponent: () => import('./salas/salas').then(m => m.SalasAdmin)
  },
];