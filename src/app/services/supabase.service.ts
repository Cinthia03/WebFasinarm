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
      .maybeSingle();
  }

  async createMantenimiento(data: any) {
    return await this.supabase
      .from('mantenimiento')
      .insert([data])
      .select();
  }

  async updateMantenimiento(id: number, data: any) {
    return await this.supabase
      .from('mantenimiento')
      .update(data)
      .eq('id_mantenimiento', id)
      .select();
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
    if (error) {
      console.error('Error uploading file:', error);
      throw error;  
    }
    if (!data) {
      throw new Error('No data returned from upload');
    }
    console.log('Upload data:', data);  // Para debug
    const { data: urlData } = this.supabase.storage
      .from('mantenimientos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
}