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
        path: 'home',
        
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
         
    },    
    {
        path: 'anonimo',
        loadComponent: () => import('./pages/registro/registro-anonimo/registro-anonimo').then(m => m.RegistroAnonimo)
    }
];
