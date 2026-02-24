import { Component, OnInit  } from '@angular/core';
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
import { Router } from '@angular/router';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatRadioModule, MatButtonModule, MatCardModule,
    MatIconModule, HttpClientModule
  ],
  templateUrl: './mantenimiento.html',
  styleUrls: ['./mantenimiento.css']
})
export class Mantenimiento implements OnInit {
  mantenimientoForm: FormGroup;
  selectedFile: File | null = null;
  form!: FormGroup;

  // 👇 CAMBIA ESTA URL SEGÚN ENTORNO
  private API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/mantenimiento'
    : 'https://web-fasinarm.vercel.app/api/mantenimiento';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
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

  ngOnInit(): void {

    // 🔹 1️⃣ Crear el formulario primero
    this.form = this.fb.group({
      id_mantenimiento: [''],
      usuario: [''],
      cedula: [''],
      ubicacion: [''],
      prioridad: [''],
      tipomantenimiento: [''],
      equipo: [''],
      asunto: [''],
      descripcion: ['']
    });

    // 🔹 2️⃣ Luego cargar datos si viene desde editar
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };

    if (state?.data) {
      this.form.patchValue(state.data);
    }
  }


  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo:', this.selectedFile.name);
    }
  }

  guardar() {
    if (this.mantenimientoForm.invalid) {
      alert('⚠️ Completa todos los campos obligatorios');
      return;
    }

    const formData = new FormData();
    Object.entries(this.mantenimientoForm.value).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    this.http.post(this.API_URL, formData).subscribe({
      next: (res) => {
        console.log('✅ Guardado:', res);
        alert('🎉 Mantenimiento registrado correctamente');
        this.mantenimientoForm.reset({
          prioridad: 'Media',
          tipomantenimiento: 'Preventivo'
        });
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('❌ Error:', err);
        alert('❌ Error: ' + (err.error?.error || 'Servidor no responde'));
      }
    });
  }
}
