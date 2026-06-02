import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { TareaService } from '../services/tarea.service';
import { CrearTareaDto, TareaDto, PrioridadTarea } from '../models/tarea.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;

  isEdit = false;
  loading = false;
  error = '';
  tareaId = '';
  prioridades: PrioridadTarea[] = ['Baja', 'Media', 'Alta'];

  constructor(
    private fb: FormBuilder,
    private tareaService: TareaService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', Validators.maxLength(400)],
      fechaLimite: ['', Validators.required],
      prioridad: ['Media', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.isEdit = true;
    this.tareaId = id;
    this.loading = true;

    this.tareaService
      .obtenerPorId(id)
      .pipe(
        finalize(() => (this.loading = false)),
        catchError(() => {
          this.error = 'No se pudo cargar la tarea. Verifica el ID o el estado del backend.';
          return of(null as TareaDto | null);
        }),
      )
      .subscribe((tarea) => {
        if (!tarea) {
          return;
        }

        this.form.patchValue({
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          fechaLimite: tarea.fechaLimite.slice(0, 10),
          prioridad: tarea.prioridad,
        });
      });
  }

  enviarFormulario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const payload: CrearTareaDto = this.form.value as CrearTareaDto;
    const request = this.isEdit
      ? this.tareaService.actualizar(this.tareaId, payload)
      : this.tareaService.crear(payload);

    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Error al guardar la tarea. Verifica los datos e intenta de nuevo.';
      },
    });
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  control(nombre: string) {
    return this.form.get(nombre);
  }
}
