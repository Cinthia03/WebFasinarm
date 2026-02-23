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
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './mantenimiento.html',
  styleUrls: ['./mantenimiento.css']
})
export class Mantenimiento {

  mantenimientoForm: FormGroup;
  selectedFile: File | null = null;

  //private API_URL = 'http://localhost:3000/api/mantenimiento'; //SOLO USO LOCAL
  API_URL = 'https://web-fasinarm-1to1mkron-cinthia03s-projects.vercel.app/api/mantenimiento';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.mantenimientoForm = this.fb.group({
      usuario: ['', Validators.required],
      cedula: ['', Validators.required],
      ubicacion: ['', Validators.required],
      prioridad: ['Media', Validators.required],
      tipomantenimiento: ['Preventivo', Validators.required],
      equipo: [''],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  guardar() {
    if (this.mantenimientoForm.invalid) return;

    const formData = new FormData();

    Object.keys(this.mantenimientoForm.value).forEach(key => {
      formData.append(key, this.mantenimientoForm.value[key]);
    });

    if (this.selectedFile) {
      formData.append('archivo', this.selectedFile);
    }

    this.http.post(this.API_URL, formData).subscribe({
      next: () => {
        alert("✅ Registro exitoso");
        this.mantenimientoForm.reset({
          prioridad: 'Media',
          tipomantenimiento: 'Preventivo'
        });
        this.selectedFile = null;
      },
      error: (err) => {
        alert("❌ Error: " + (err.error?.error || "Servidor no responde"));
      }
    });
  }
}