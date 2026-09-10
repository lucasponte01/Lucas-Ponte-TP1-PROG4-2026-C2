import { inject, Service, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import Usuario from '../../../interfaces/usuario';

@Service()
export class Auth {
    private _supabaseService = inject(SupabaseService);
    private router = inject(Router);

    public usuarioActual: WritableSignal<User | null> = signal<User | null>(null);

    constructor(){
        this._supabaseService.Auth.onAuthStateChange((event , session) =>{
            if(session?.user){
                this.usuarioActual.set(session.user);
                this.router.navigateByUrl('/home')
            }else{
                this.usuarioActual.set(null);
                this.router.navigateByUrl('/login');
            }   
        });
    }

    public async registrar(usuario : Usuario){
    const {data,error} = await this._supabaseService.Auth.signUp({
            email: usuario.email,
            password: usuario.contrasena,
            options: {
            data: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                edad: usuario.edad,
                avatar_url: usuario.foto
                }
            }
        });
            if(error) {
                throw error
            };

        return data
        
    }


    async cerrarSesion() {
    await this._supabaseService.Auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
    

