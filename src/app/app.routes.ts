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
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
         
    },  
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate :[authGuard],
    },
    {
        path: 'candy',
        loadComponent: () => import('./pages/home/candy/candy').then(m => m.Candy),
        canActivate :[authGuard],
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
        path:'compra/funciones',
        loadComponent:() => import('./pages/funciones/funciones').then(m => m.Funciones),
        canActivate :[authGuard],
    },
    {
        path:'resenas',
        loadComponent:() => import('./pages/resenas/resenas').then(m => m.Resenas),
        canActivate :[authGuard]
    },
    
];
