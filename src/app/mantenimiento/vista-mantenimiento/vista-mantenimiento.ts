import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vista-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './vista-mantenimiento.html',
  styleUrls: ['./vista-mantenimiento.css'],
})
export class VistaMantenimiento implements OnInit {

  dataSource = new MatTableDataSource<any>();

  apiUrl = 'http://localhost:3000/mantenimiento';

  displayedColumns: string[] = [
    'usuario',
    'cedula',
    'ubicacion',
    'prioridad',
    'tipoMantenimiento',
    'equipo',
    'asunto',
    'descripcion',
    'fecha',
    'archivo',
    'acciones'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  esImagen(url: string): boolean {
    return url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false;
  }

  esPdf(url: string): boolean {
    return url ? /\.pdf$/i.test(url) : false;
  }

  aplicarFiltro(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  editar(data: any) {
    this.router.navigate(['/mantenimiento'], {
      state: { data }
    });
  }

  eliminar(id: any) {
  if (id === undefined || id === null) {
    console.error("❌ El ID recibido es nulo o indefinido. Revisa el nombre de la columna en el HTML.");
    // Imprime un elemento del dataSource para ver sus nombres reales
    console.log("Estructura del primer registro:", this.dataSource.data[0]);
    return;
  }

  if (confirm('¿Deseas eliminar este registro?')) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        alert('Eliminado correctamente');
        // Filtramos localmente para actualizar la vista rápido
        this.dataSource.data = this.dataSource.data.filter(item => 
          (item.id_mantenimiento !== id && item.id !== id)
        );
      },
      error: (err) => console.error("Error al eliminar:", err)
    });
  }
}
}