import { Routes } from '@angular/router';
import { authGuard } from './pages/guard/auth-guard';
import { Candy } from './pages/home/candy/candy';

export const routes: Routes = [
    {
         path: '',
        redirectTo: 'login',
        pathMatch: 'full'
        
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path:'login/admin',
        loadComponent:() => import('./pages/login/login-admin/login-admin').then(m => m.LoginAdmin)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        
    
    },
    {
        path: 'candy',
        loadComponent: () => import('./pages/home/candy/candy').then(m => m.Candy),
    },
    {
        path:'resenas',
        loadComponent:() => import('./pages/resenas/resenas').then(m => m.Resenas),
        canActivate :[authGuard]
    },
    {
        path: 'compra',
        loadChildren: () => import('./pages/pelicula-detalles/peliculas.routes').then(m => m.homeroute),
        
    },
    {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
         
    },    
    {
        path: 'anonimo',
        loadComponent: () => import('./pages/registro/registro-anonimo/registro-anonimo').then(m => m.RegistroAnonimo)
    },
    {
        path: 'admin',
        loadChildren:() => import('./pages/admin/admin.routes').then(m => m.instalarroute),
        canActivate :[authGuard],
        data:{roles:['admin']}
    },
    {
        path:'perfil',
        loadComponent:() => import('./pages/perfil/perfil').then(m => m.Perfil),
        canActivate :[authGuard]
    }
    
    
];
