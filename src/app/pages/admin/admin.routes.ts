import { Route } from "@angular/router";
import { authGuard } from "../guard/auth-guard";



export const instalarroute: Route[] = [
  {
    path: 'peliculas',
    loadComponent: () => import('./peliculas/peliculas').then(m => m.PeliculasAdmin),
    canActivate :[authGuard],
    data:{roles:['admin']}
  },
  {
    path: 'funciones',
    loadComponent: () => import('./funciones/funciones').then(m => m.FuncionesAdmin),
    canActivate :[authGuard],
    data:{roles:['admin']}
  },
  {
    path: 'salas',
    loadComponent: () => import('./salas/salas').then(m => m.SalasAdmin),
    canActivate :[authGuard],
    data:{roles:['admin']}
  },
];