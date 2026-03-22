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