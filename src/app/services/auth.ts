import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import Usuario from '../interfaces/usuario';
import { parseDate, toISODateOnly } from '../utils/parse_date';

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

  verificarAccesoPelicula(restriccionEdad: number | null): boolean {
    // Si es null o 0, significa que no tiene restricción
    if (!restriccionEdad || restriccionEdad === 0) {
      return true; 
    }

    const user = this.usuarioActual();
    const fechaNacimiento = user?.user_metadata?.['fecha_nacimiento'];

    if (!fechaNacimiento) {
      return false; // Si no hay fecha registrada, por seguridad bloqueamos
    }

    // Calculamos la edad actual del usuario
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const noCumplio = hoy.getMonth() < fecha.getMonth() || (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
    if (noCumplio) edad--;

    console.log("Edad del usuario:", edad, "Edad mínima requerida:", restriccionEdad);

    // Retorna true solo si la edad es mayor o igual a la restricción de Supabase
    return edad >= restriccionEdad;
  }

    public async registrar(usuario : Usuario){
      const fecha = parseDate(usuario.fecha_nacimiento);
      if (!fecha) throw new Error('Fecha de nacimiento inválida');


    const {data,error} = await this._supabaseService.Auth.signUp({
            email: usuario.email,
            password: usuario.contrasena,
            options: {
            data: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                fecha_nacimiento: toISODateOnly(fecha),
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
      const fecha = parseDate(usuario.fecha_nacimiento);
        if (!fecha) throw new Error('Fecha de nacimiento inválida');
      const {data,error} = await this._supabaseService.Auth.signUp({
        email: usuario.email,
          password: usuario.contrasena,
          options: {
          data: {
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              fecha_nacimiento: toISODateOnly(fecha),
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
    
  
  async login(res: any) {
    const { data, error } = await this._supabaseService.Auth.signInWithPassword({
      email: res.email,
      password: res.password,
    });

    if (error) {
      throw new Error(`Error al loguearse: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Error al loguearse: ningún usuario retornado');
    }

    
    const { data: usuarioData, error: dbError } = await this._supabaseService.client
      .from('usuarios')
      .select('tipo')
      .eq('id', data.user.id)
      .maybeSingle();

    if (dbError || !usuarioData) {
      await this._supabaseService.Auth.signOut();
      throw new Error('Acceso denegado: el usuario no tiene un rol asignado');
    }

    const tipo = usuarioData.tipo?.trim();

    
    this.usuarioActual.set(data.user);
    
    return { user: data.user, tipo: tipo }; 
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
    

