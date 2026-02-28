import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './mantenimiento.html',
  styleUrls: ['./mantenimiento.css']
})
export class Mantenimiento implements OnInit {

  mantenimientoForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.mantenimientoForm = this.fb.group({
      id_mantenimiento: [null],
      usuario: ['', Validators.required],
      cedula: ['', Validators.required],
      ubicacion: ['', Validators.required],
      prioridad: ['Media'],
      tipomantenimiento: ['Preventivo'],
      equipo: [''],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required],
      archivo: ['']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarRegistro(Number(id));
    }
  }

  async cargarRegistro(id: number) {
    const { data, error } =
      await this.supabaseService.getMantenimientoById(id);
    if (error) {
      alert(error.message);
      return;
    }
    if (data) {
      this.mantenimientoForm.patchValue(data);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files?.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  //GUARDAR
  async guardar() {
    if (this.mantenimientoForm.invalid) {
      alert('Completa los campos obligatorios');
      return;
    }
    try {
      const raw = this.mantenimientoForm.getRawValue();
      let archivoUrl = raw.archivo || null; 
      if (this.selectedFile) {
        try {
          archivoUrl = await this.supabaseService.uploadFile(this.selectedFile);
          console.log('Archivo subido:', archivoUrl);
        } catch (uploadError: unknown) {  
          console.error('Error subiendo archivo:', uploadError);
          let errorMessage = 'Error desconocido';
          if (uploadError instanceof Error) {
            errorMessage = uploadError.message;
          } else if (typeof uploadError === 'string') {
            errorMessage = uploadError;
          }     
          alert(`Error subiendo archivo: ${errorMessage}`);
          return;
        }
      }
      const formData: any = {
        usuario: raw.usuario,
        cedula: raw.cedula,
        ubicacion: raw.ubicacion,
        prioridad: raw.prioridad,
        tipomantenimiento: raw.tipomantenimiento,
        equipo: raw.equipo,
        asunto: raw.asunto,
        descripcion: raw.descripcion,
        archivo: archivoUrl 
      };

      const id = raw.id_mantenimiento;
      let response;
      if (id) {
        response = await this.supabaseService.updateMantenimiento(id, formData);
      } else {
        response = await this.supabaseService.createMantenimiento(formData);
      }
      if (response.error) {
        alert(`Error al guardar: ${response.error.message}`);
        return;
      }
      alert('Registro guardado correctamente');
      this.router.navigate(['/vistaMantenimiento']);
    } catch (error: any) {
      console.error('Error general:', error);
      alert(`Error: ${error.message}`);
    }
  }
}