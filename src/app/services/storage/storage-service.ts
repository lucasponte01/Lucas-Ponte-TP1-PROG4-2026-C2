import { inject, Injectable  } from '@angular/core';
import { environment } from '../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';


@Injectable({ providedIn: 'root' })
export class StorageService {
    private supabase = inject(SupabaseService);
    get client() {
      return this.supabase.client;
    }

  public async listarAvatares(): Promise<string[]> {
    const { data, error } = await this.client.storage.from('avatars').list('', { limit: 100 });

    if (error) throw error;

    return (data ?? [])
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file =>
        this.client.storage.from('avatars').getPublicUrl(file.name).data.publicUrl
      );
  }

  public async listar_peliculas(): Promise<string[]> {
      // Cambia 'peliculas' por 'Películas'
      const { data, error } = await this.client.storage.from('Peliculas').list('', { limit: 100 });

      if (error) throw error;

      return (data ?? [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file =>
          this.client.storage.from('Peliculas').getPublicUrl(file.name).data.publicUrl
        );
  }


//push noti import swpush de service worked
/*
  sw = inject(SwPush)
  
  registrar(){
    if(!this.sw.isEnabled){
      return
    }

    this.sw.requestSubscription({serverPublicKey:environment.vapid})
  }
  */
}
