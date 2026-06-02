export type PrioridadTarea = 'Baja' | 'Media' | 'Alta';
export type EstadoTarea = 'Pendiente' | 'EnProgreso' | 'Completada' | 'Cancelada';

export interface TareaDto {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaLimite: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  estaVencida: boolean;
  diasRestantes: number;
  motivoCancelacion?: string;
}

export interface CrearTareaDto {
  titulo: string;
  descripcion?: string;
  fechaLimite: string;
  prioridad: PrioridadTarea;
}

export interface ActualizarTareaDto {
  titulo: string;
  descripcion?: string;
  fechaLimite: string;
  prioridad: PrioridadTarea;
}

export interface CambiarEstadoDto {
  accion: 'iniciar' | 'completar' | 'cancelar';
  motivoCancelacion?: string;
}
