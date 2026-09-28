import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import Usuario from '../interfaces/usuario';

@Injectable({ providedIn: 'root' })
export class Auth {
    private _supabaseService = inject(SupabaseService);
    private router = inject(Router);
    usuarioActual = signal<User | null>(null);


    constructor(){
        this._supabaseService.Auth.onAuthStateChange((event , session) =>{
            if(session?.user){
                this.usuarioActual.set(session?.user ?? null);
                
            }else{
                this.usuarioActual.set(null) ;
                
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
                tipo_sangre: usuario.tipo_sangre,
                color_ojos: usuario.color_ojos,
                dias_vacaciones: usuario.dias_vacaciones,
                avatar_url: usuario.foto,
                
                }
            }
          
        });
        
            if(error) {
                throw error
            };

        this.router.navigate(['/']);
        return data
        
    }

    public async registrar_admin(usuario : Usuario){
      const {data,error} = await this._supabaseService.Auth.signUp({
        email: usuario.email,
          password: usuario.contrasena,
          options: {
          data: {
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              edad: usuario.edad,
              tipo_sangre: usuario.tipo_sangre,
              color_ojos: usuario.color_ojos,
              dias_vacaciones: usuario.dias_vacaciones,
              avatar_url: usuario.foto,
              tipo: 'admin'
            }
          }
            
        });
          
        if(error) {
            throw error
        };

      this.router.navigate(['/']);
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
    const { data: usuarioData, error: dbError } = await this._supabaseService.client.from('usuarios').select('tipo').eq('id', data.user.id).single();
    const tipoEnBaseDeDatos = usuarioData?.tipo?.trim();
    if (dbError || usuarioData?.tipo || tipoEnBaseDeDatos !== 'cliente') {
      await this._supabaseService.Auth.signOut();
      throw new Error('Acceso denegado: el usuario no es cliente');
    }else{
      this.usuarioActual.set(data.user);
      this.router.navigate(['/home']);
      return data.user;
    }
  }

  async logear_admin(res: any) {
    const { data, error } = await this._supabaseService.Auth.signInWithPassword({
      email: res.email,
      password: res.password,
    });

    if (error) {
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Login failed: no user returned');
    }

    // Consultamos el tipo en la tabla usuarios
    const { data: usuarioData, error: dbError } = await this._supabaseService.client
      .from('usuarios')
      .select('tipo')
      .eq('id', data.user.id)
      .maybeSingle();

    console.log("Rol obtenido de la BD:", usuarioData);

    // Validamos que sea admin (usando trim por seguridad)
    if (dbError || !usuarioData || usuarioData.tipo?.trim() !== 'admin') {
      await this._supabaseService.Auth.signOut();
      throw new Error('Acceso denegado: el usuario no es administrador');
    }

    this.usuarioActual.set(data.user);
    return data.user;
  }

  nombre_invi = signal<string>("")
  email_invi = signal<string>("")

  logear_anonimo(nombre:string , email:string):void{
    this.nombre_invi.set(nombre);
    this.email_invi.set(email)

    this.router.navigate(['/home'])
  }


    async cerrarSesion() {
     const{error} = await this._supabaseService.Auth.signOut();
    
      this.usuarioActual.set(null);
      this.router.navigate(['/'])
      if(error){
        throw new Error(
          `Logout failed: ${error.message}`
        );
      }
  }
}
    

