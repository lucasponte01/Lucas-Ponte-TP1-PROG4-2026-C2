import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { SupabaseService } from '../../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const supa = inject(SupabaseService)

  
  const esAnonimo = auth.nombre_invi && auth.nombre_invi().trim() !== '';
  if (esAnonimo) {
    return true; 
  }

 
  const usuarioSupabase = auth.usuarioActual ? auth.usuarioActual() : null;
  
  if (!usuarioSupabase) {
    
    return router.createUrlTree(['/login']);
  }

  const rolesPermitidos = route.data?.['roles'] as string[];
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    
    const { data: usuarioData, error } = await supa.client
      .from('usuarios')
      .select('tipo')
      .eq('id', usuarioSupabase.id)
      .maybeSingle();

    if (error || !usuarioData || !rolesPermitidos.includes(usuarioData.tipo?.trim())) {
   
      return router.createUrlTree(['/home']);
    }
  }

  return true;
};