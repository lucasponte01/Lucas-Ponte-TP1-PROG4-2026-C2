import { Routes } from '@angular/router';
import { authGuard } from './pages/guard/auth-guard';

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
        
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'home/admin',
        
        loadComponent: () => import('./pages/home/home/admin/admin').then(m => m.Admin)
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
        loadChildren:() => import('./pages/admin/admin.routes').then(m => m.instalarroute)
    }
    
];
