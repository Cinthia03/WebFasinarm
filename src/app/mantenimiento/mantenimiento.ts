import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
export class Mantenimiento {

  mantenimientoForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.mantenimientoForm = this.fb.group({
      usuario: ['', Validators.required],
      cedula: ['', Validators.required],
      ubicacion: ['', Validators.required],
      prioridad: ['Media', Validators.required],
      tipoMantenimiento: ['', Validators.required],
      equipo: [''],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  get prioridadSeleccionada(): string {
    return this.mantenimientoForm.get('prioridad')?.value;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  guardar() {
    if (this.mantenimientoForm.valid) {
      console.log('Datos del mantenimiento:', this.mantenimientoForm.value);
      console.log('Archivo:', this.selectedFile);
    }
  }
}