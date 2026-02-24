import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './vista-mantenimiento.html',
  styleUrls: ['./vista-mantenimiento.css']
})
export class VistaMantenimiento implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>();
  private apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/mantenimiento'
    : 'https://web-fasinarm.vercel.app/api/mantenimiento';

  displayedColumns = ['usuario','cedula','ubicacion','prioridad','tipomantenimiento','equipo','asunto','descripcion','fecha','archivo','acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { this.cargarDatos(); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; }

  cargarDatos() {
    this.http.get<any[]>(this.apiUrl).subscribe({ next: data => this.dataSource.data = data });
  }

  aplicarFiltro(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  editar(element: any) {
    this.router.navigate(['/mantenimiento', element.id_mantenimiento]);
  }
  
  eliminar(id: number) {
    if (!id) return alert("ID inválido");
    if (!confirm('¿Deseas eliminar este registro?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter(item => item.id_mantenimiento !== id);
        alert('Registro eliminado');
      },
      error: err => alert('Error al eliminar: ' + err.message)
    });
  }

  esImagen(url: string) { return url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false; }
  esPdf(url: string) { return url ? /\.pdf$/i.test(url) : false; }
}