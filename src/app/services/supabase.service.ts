import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  async getMantenimientos() {
    return await this.supabase
      .from('mantenimiento')
      .select('*')
      .order('id_mantenimiento', { ascending: false })
      .limit(50);
  }

  async getMantenimientoById(id: number) {
    return await this.supabase
      .from('mantenimiento')
      .select('*')
      .eq('id_mantenimiento', id)
      .single();
  }

  async createMantenimiento(data: any) {
    return await this.supabase
      .from('mantenimiento')
      .insert([data])
      .select()
      .single();
  }

  async updateMantenimiento(id: number, data: any) {
    return await this.supabase
      .from('mantenimiento')
      .update(data)
      .eq('id_mantenimiento', id)
      .select()
      .single();
  }

  async deleteMantenimiento(id: number) {
    return await this.supabase
      .from('mantenimiento')
      .delete()
      .eq('id_mantenimiento', id);
  }

  async uploadFile(file: File) {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await this.supabase.storage
      .from('mantenimientos')
      .upload(`files/${fileName}`, file, { upsert: true });

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage
      .from('mantenimientos')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  }
}