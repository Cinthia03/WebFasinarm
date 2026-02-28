import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})

export class Inicio {

  constructor(private router: Router) {}

  RegistroMantenimiento() {
    this.router.navigate(['/mantenimiento']);
  }

  irVistaMantenimiento() {
    const codigo = prompt("Ingrese el código de acceso:");
    if (codigo === "4859") { 
      this.router.navigate(['/vistaMantenimiento']);
    } else {
      alert("Código incorrecto");
    }
  }

  irPresupuesto() {
    this.router.navigate(['/']);
  }
}

