/*import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

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
export class Mantenimiento {
  mantenimientoForm!: FormGroup;
  selectedFile: File | null = null;
  private API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/mantenimiento'
    : 'https://web-fasinarm.vercel.app/api/mantenimiento';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.mantenimientoForm = this.fb.group({
      id_mantenimiento: [''],
      usuario: ['', Validators.required],
      cedula: ['', Validators.required],
      ubicacion: ['', Validators.required],
      prioridad: ['Media', Validators.required],
      tipomantenimiento: ['Preventivo', Validators.required],
      equipo: [''],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`${this.API_URL}/${id}`).subscribe({
        next: (data: any) => this.mantenimientoForm.patchValue(data),
        error: err => console.error('Error cargando registro:', err)
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.selectedFile = input.files[0];
  }

  guardar() {
    if (this.mantenimientoForm.invalid) return alert('⚠️ Completa todos los campos obligatorios');

    const formData = new FormData();
    Object.entries(this.mantenimientoForm.value).forEach(([key, value]) => {
      if (value != null) formData.append(key, value as string);
    });
    if (this.selectedFile) formData.append('archivo', this.selectedFile);

    const id = this.mantenimientoForm.value.id_mantenimiento;
    const httpCall = id ? this.http.put(`${this.API_URL}/${id}`, formData) : this.http.post(this.API_URL, formData);

    httpCall.subscribe({
      next: () => {
        alert('🎉 Registro guardado correctamente');
        this.mantenimientoForm.reset({ prioridad: 'Media', tipomantenimiento: 'Preventivo' });
        this.selectedFile = null;
        this.router.navigate(['/vistaMantenimiento']);
      },
      error: err => alert('❌ Error: ' + (err.error?.error || 'Servidor no responde'))
    });
  }
}*/


import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

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
  mantenimientoForm!: FormGroup;
  selectedFile: File | null = null;
  private API_URL = ''; // Inicializado vacío para SSR

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectamos el ID de plataforma
  ) {
    // Definimos la URL solo en el navegador para evitar errores en Vercel
    if (isPlatformBrowser(this.platformId)) {
      this.API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/mantenimiento'
        : 'https://web-fasinarm-publica.vercel.app/api/mantenimiento';
    }
  }

  ngOnInit(): void {
    this.mantenimientoForm = this.fb.group({
      id_mantenimiento: [''],
      usuario: ['', Validators.required],
      cedula: ['', Validators.required],
      ubicacion: ['', Validators.required],
      prioridad: ['Media', Validators.required],
      tipomantenimiento: ['Preventivo', Validators.required],
      equipo: [''],
      asunto: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    // Solo intentamos cargar datos si estamos en el cliente y hay una URL
    if (this.API_URL) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.http.get(`${this.API_URL}/${id}`).subscribe({
          next: (data: any) => this.mantenimientoForm.patchValue(data),
          error: err => console.error('Error cargando registro:', err)
        });
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.selectedFile = input.files[0];
  }

  guardar() {
    if (this.mantenimientoForm.invalid) return alert('⚠️ Completa todos los campos obligatorios');
    if (!this.API_URL) return; // Seguridad extra

    const formData = new FormData();
    Object.entries(this.mantenimientoForm.value).forEach(([key, value]) => {
      if (value != null) formData.append(key, value as string);
    });
    if (this.selectedFile) formData.append('archivo', this.selectedFile);

    const id = this.mantenimientoForm.value.id_mantenimiento;
    const httpCall = id 
      ? this.http.put(`${this.API_URL}/${id}`, formData) 
      : this.http.post(this.API_URL, formData);

    httpCall.subscribe({
      next: () => {
        alert('🎉 Registro guardado correctamente');
        this.mantenimientoForm.reset({ prioridad: 'Media', tipomantenimiento: 'Preventivo' });
        this.selectedFile = null;
        this.router.navigate(['/vistaMantenimiento']);
      },
      error: err => alert('❌ Error: ' + (err.error?.error || 'Servidor no responde'))
    });
  }
}