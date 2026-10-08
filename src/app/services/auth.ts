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

   
    return edad >= restriccionEdad;
  }

    async consultarhistorial_de_peliculas() {
    try {
      const { data: { user } } = await this._supabaseService.Auth.getUser();
      if (!user) return [];

      // 1. Obtenemos las compras del usuario
      const { data: compras, error: errorCompras } = await this._supabaseService.client
        .from('compras')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha_compra', { ascending: false });

      if (errorCompras || !compras) {
        console.error('Error al cargar compras:', errorCompras);
        return [];
      }

      // 2. Recorremos cada compra para buscar su función y sus entradas de forma independiente
      const historialCompleto = await Promise.all(
        compras.map(async (compra) => {
          let funcionData = null;
          let peliculaData = null;
          let entradasData = [];

          // Intentamos buscar la función asociada (probando el campo funcion_id o id_funcion)
          const idFuncion = compra.funcion_id || compra.id_funcion;
          if (idFuncion) {
            const { data: funcion } = await this._supabaseService.client
              .from('funciones')
              .select('*')
              .eq('id', idFuncion)
              .maybeSingle();

            if (funcion) {
              funcionData = funcion;
              const idPelicula = funcion.pelicula_id || funcion.id_pelicula;
              
              if (idPelicula) {
                const { data: pelicula } = await this._supabaseService.client
                  .from('peliculas')
                  .select('*')
                  .eq('id', idPelicula)
                  .maybeSingle();

                if (pelicula) {
                  peliculaData = pelicula;
                }
              }
            }
          }

          // Buscamos las entradas asociadas a esta compra
          const { data: entradas } = await this.client_entradas_o_similar(compra.id);
          if (entradas) {
            entradasData = entradas;
          }

          return {
            ...compra,
            funciones: funcionData ? {
              ...funcionData,
              peliculas: peliculaData
            } : null,
            compra_entradas: entradasData
          };
        })
      );

      return historialCompleto;
    } catch (error) {
      console.error('Error al cargar historial:', error);
      return [];
    }
  }

  private async client_entradas_o_similar(compraId: string) {
    try {
      return await this._supabaseService.client
        .from('compra_entradas')
        .select('*')
        .eq('compra_id', compraId);
    } catch {
      return { data: [] };
    }
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
    

