import { inject, Service, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import Usuario from '../../../interfaces/usuario';

@Service()
export class Auth {
    private _supabaseService = inject(SupabaseService);
    private router = inject(Router);
    usuarioActual: any = null;


    constructor(){
        this._supabaseService.Auth.onAuthStateChange((event , session) =>{
            if(session?.user){
                this.usuarioActual = session.user;
                this.router.navigateByUrl('/home')
            }else{
                this.usuarioActual = null;
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

  async logear(res: any) {
    const { data, error } = await this._supabaseService.Auth.signInWithPassword({
      email: res.email,
      password: res.password,
    });
    if (error) {
        throw new Error(
          `Login failed: ${error.message}`
        );
      }

    if (!data.user) {
      throw new Error(
        'Login failed: no user returned'
      );
    }

    this.usuarioActual = data.user;
    
    return data.user;
  }


    async cerrarSesion() {
     const{error} = await this._supabaseService.Auth.signOut();
    
      this.usuarioActual = null;
      this.router.navigate(['/'])
      if(error){
        throw new Error(
          `Logout failed: ${error.message}`
        );
      }
  }
}
    

