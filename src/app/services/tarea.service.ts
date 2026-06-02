import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TareaDto,
  CrearTareaDto,
  ActualizarTareaDto,
  CambiarEstadoDto,
} from '../models/tarea.model';

const API_BASE_URL = 'http://localhost:5050/api/tareas';

@Injectable({
  providedIn: 'root',
})
export class TareaService {
  constructor(private http: HttpClient) {}

  obtenerTodas(prioridad?: string, estado?: string): Observable<TareaDto[]> {
    let params = new HttpParams();
    if (prioridad) {
      params = params.set('prioridad', prioridad);
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<TareaDto[]>(API_BASE_URL, { params });
  }

  obtenerPorId(id: string): Observable<TareaDto> {
    return this.http.get<TareaDto>(`${API_BASE_URL}/${id}`);
  }

  crear(tarea: CrearTareaDto): Observable<TareaDto> {
    return this.http.post<TareaDto>(API_BASE_URL, tarea);
  }

  actualizar(id: string, tarea: ActualizarTareaDto): Observable<TareaDto> {
    return this.http.put<TareaDto>(`${API_BASE_URL}/${id}`, tarea);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/${id}`);
  }

  cambiarEstado(
    id: string,
    accion: 'iniciar' | 'completar' | 'cancelar',
    motivoCancelacion?: string,
  ): Observable<void> {
    const body: CambiarEstadoDto = { accion, motivoCancelacion };
    return this.http.patch<void>(`${API_BASE_URL}/${id}/estado`, body);
  }
}
