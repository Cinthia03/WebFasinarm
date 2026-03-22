import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  styleUrls: ['./vista-mantenimiento.css']
})
export class VistaMantenimiento implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'codigo',
    'usuario',
    'cedula',
    'ubicacion',
    'prioridad',
    'tipomantenimiento',
    'equipo',
    'asunto',
    'descripcion',
    'fecha',
    'archivo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<any>([]);
  cargando = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  traducirMotivo(motivo: string): string {
    switch (motivo) {
      case 'danio_total': return 'Equipo con daño total (No reparable)';
      case 'obsoleto': return 'Equipo obsoleto (Tecnologia antigua)';
      case 'software_desuso': return 'Software en desuso / Licencia vencida';
      case 'reemplazo': return 'Reemplazo por equipo nuevo';
      default: return '';
    }
  }

  async cargarDatos() {
    this.cargando = true;
    const { data, error } = await this.supabaseService.getMantenimientos();
    this.cargando = false;
    if (error) {
      alert(error.message);
      return;
    }
    this.dataSource.data = data || [];
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  imprimir() {
    const contenido = document.getElementById('tabla-imprimir')?.innerHTML;
    if (!contenido) return;
    const ventana = window.open('', '', 'width=1000,height=800');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Reporte de Mantenimiento</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 11px; }
              th { background-color: #f4f4f4; }
              
              /* --- OCULTAR ELEMENTOS NO DESEADOS --- */
              
              /* Ocultar la columna de Acciones (th y td) */
              .mat-column-acciones, 
              th:last-child, 
              td:last-child { 
                display: none !important; 
              }

              /* Ocultar flechas de ordenamiento de Angular Material */
              .mat-sort-header-arrow { display: none !important; }
              
              /* Ocultar el paginador si se coló en el innerHTML */
              mat-paginator, .mat-mdc-paginator { display: none !important; }

              /* Ajustar badges de prioridad para que se vean bien en blanco y negro */
              .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
              .alta { color: red; }
              .media { color: orange; }
              .baja { color: green; }

              h2 { text-align: center; color: #1a3a63; }
            </style>
          </head>
          <body>
            <h2>Registros de Mantenimiento</h2>
            ${contenido}
          </body>
        </html>
      `);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
        ventana.close();
      }, 500);
    }
  }

  editar(element: any) {
    this.router.navigate(['/mantenimiento', element.id_mantenimiento]);
  }

  async eliminar(id: number) {
    if (!confirm('¿Eliminar registro?')) return;
    const { error } = await this.supabaseService.deleteMantenimiento(id);
    if (error) {
      alert(error.message);
      return;
    }
    this.cargarDatos();
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }
}