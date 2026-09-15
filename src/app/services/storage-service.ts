import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Service()
export class StorageService {
    private supabase: SupabaseClient;
  

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  public get Auth() {
    return this.supabase.auth;
  }

  public get Stg() {
    return this.supabase.storage;
  }

public async listarAvatares(): Promise<string[]> {
  const { data, error } = await this.Stg.from('avatars').list('', { limit: 100 });

  if (error) throw error;

  return (data ?? [])
    .filter(file => file.name !== '.emptyFolderPlaceholder')
    .map(file =>
      this.Stg.from('avatars').getPublicUrl(file.name).data.publicUrl
    );
}
  
}
