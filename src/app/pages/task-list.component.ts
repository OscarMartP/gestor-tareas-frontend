import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { TareaDto } from '../models/tarea.model';
import { TareaService } from '../services/tarea.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tareas: TareaDto[] = [];
  loading = false;
  error = '';

  selectedPriority = '';
  selectedCompletion = 'all';

  completionOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'notCompleted', label: 'No completadas' },
  ];

  constructor(private tareaService: TareaService, private router: Router) {}

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.loading = true;
    this.error = '';
    const estado = this.selectedCompletion === 'completed' ? 'Completada' : undefined;
    this.tareaService
      .obtenerTodas(this.selectedPriority || undefined, estado)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        catchError(() => {
          this.error = 'No se pudieron cargar las tareas. Verifica que el backend esté activo.';
          return of([] as TareaDto[]);
        }),
      )
      .subscribe((tareas) => {
        this.tareas =
          this.selectedCompletion === 'notCompleted'
            ? tareas.filter((tarea) => tarea.estado !== 'Completada')
            : tareas;
      });
  }

  limpiarFiltros(): void {
    this.selectedPriority = '';
    this.selectedCompletion = 'all';
    this.cargarTareas();
  }

  navegarAEditar(id: string): void {
    this.router.navigate(['/editar', id]);
  }

  eliminarTarea(id: string): void {
    const confirmado = confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.');
    if (!confirmado) {
      return;
    }

    this.loading = true;
    this.tareaService
      .eliminar(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.cargarTareas(),
        error: () => {
          this.error = 'No se pudo eliminar la tarea. Intenta de nuevo más tarde.';
        },
      });
  }

  cambiarEstado(id: string, accion: 'iniciar' | 'completar' | 'cancelar'): void {
    let motivoCancelacion: string | undefined;
    if (accion === 'cancelar') {
      const mensaje = prompt('Motivo de cancelación (requerido):');
      if (!mensaje?.trim()) {
        return;
      }
      motivoCancelacion = mensaje.trim();
    }

    const confirmacion = confirm(
      accion === 'cancelar'
        ? '¿Confirmas cancelar esta tarea?'
        : accion === 'iniciar'
        ? '¿Deseas iniciar esta tarea?'
        : '¿Deseas marcar esta tarea como completada?',
    );

    if (!confirmacion) {
      return;
    }

    this.loading = true;
    this.tareaService
      .cambiarEstado(id, accion, motivoCancelacion)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.cargarTareas(),
        error: () => {
          this.error = 'No se pudo actualizar el estado. Revisa los datos e intenta de nuevo.';
        },
      });
  }
}
