# Resumen del Backend - Gestor de Tareas

## 1. Arquitectura general

Este proyecto es un backend ASP.NET Core 10.0 con arquitectura tipo "clean-ish":
- `GestorTareas/` contiene la aplicación principal.
- `Controllers/` expone la API REST.
- `Application/` contiene servicios y DTOs.
- `Infrastructure/` contiene el acceso a datos con EF Core y el repositorio.
- `Domain/Entities/` contiene las entidades de negocio (`Tarea`, `Usuario`).

## 2. Tecnologías usadas

- ASP.NET Core 10.0
- Entity Framework Core 9.0 con `Microsoft.EntityFrameworkCore.SqlServer`
- SQL Server como proveedor de base de datos
- Swagger para documentación de la API
- CORS habilitado para `http://localhost:4200`

## 3. Configuración principal

### `Main.cs`

- Registra `GestorTareasDbContext` con la cadena de conexión `DefaultConnection`.
- Registra `ITareaRepositorio` como `TareaRepositorio`.
- Registra `ITareaService` como `TareaService`.
- Agrega controladores, Swagger y CORS.

### `appsettings.json`

La conexión por defecto es:

```json
"DefaultConnection": "Server=localhost,14333;Database=GestorTareasSimple;User Id=sa;Password=TuPassword123!;Encrypt=False;TrustServerCertificate=True;"
```

## 4. Modelo de datos

### Entidades principales

#### `Tarea`
- `Id`: GUID
- `UsuarioId`: referencia al usuario dueño de la tarea
- `Titulo`: string obligatorio
- `Descripcion`: string opcional
- `FechaCreacion`: fecha de creación
- `FechaLimite`: fecha límite
- `Prioridad`: enum `PrioridadTarea` (`Baja`, `Media`, `Alta`)
- `Estado`: enum `EstadoTarea` (`Pendiente`, `EnProgreso`, `Completada`, `Cancelada`)
- `MotivoCancelacion`: string opcional

#### `Usuario`
- `Id`: int
- `Nombre`: string
- `Email`: string único
- `PasswordHash`: string
- `FechaRegistro`: datetime2

## 5. Mapeo de base de datos

El `DbContext` usa `GestorTareasDbContext` y mapea:
- `Tarea` a tabla `Tarea`
- `Usuario` a tabla `Usuario`

### Reglas importantes
- `TareaId` es PK de `Tarea`
- `UsuarioId` es PK de `Usuario`
- La relación `Tarea` → `Usuario` es `UsuarioId` como FK
- `Prioridad` y `Estado` se guardan como `tinyint`
- `FechaLimite` es `date`
- `FechaCreacion` es `datetime2`

## 6. Endpoints disponibles

Base URL: `api/tareas`

### GET `/api/tareas`
- Devuelve todas las tareas ordenadas por fecha de creación descendente.
- Respuesta: lista de `TareaDto`.

### GET `/api/tareas/{id}`
- Devuelve una tarea por su `id`.
- Respuesta: `TareaDto` o `404 Not Found`.

### POST `/api/tareas`
- Crea una nueva tarea.
- Cuerpo: `CrearTareaDto`
- Respuesta: `201 Created` con la tarea creada.

### PUT `/api/tareas/{id}`
- Actualiza una tarea existente.
- Cuerpo: `ActualizarTareaDto`
- Respuesta: `200 OK` con la tarea actualizada, o `404` si no existe.

### DELETE `/api/tareas/{id}`
- Elimina una tarea.
- Respuesta: `204 No Content` si fue eliminada, `404` si no existe.

### PATCH `/api/tareas/{id}/estado`
- Cambia el estado de la tarea.
- Cuerpo: `CambiarEstadoDto`
- Acciones válidas: `iniciar`, `completar`, `cancelar`
- Respuesta: `204 No Content` o `400 Bad Request` si la operación no es válida.

## 7. DTOs y formato esperado

### `TareaDto`

- `Id`
- `Titulo`
- `Descripcion`
- `FechaCreacion`
- `FechaLimite`
- `Prioridad` (string)
- `Estado` (string)
- `EstaVencida` (bool)
- `DiasRestantes` (int)
- `MotivoCancelacion` (string?)

### `CrearTareaDto` y `ActualizarTareaDto`

- `Titulo`: string
- `Descripcion`: string opcional
- `FechaLimite`: fecha
- `Prioridad`: enum (`Baja`, `Media`, `Alta`)

### `CambiarEstadoDto`

- `Accion`: string (`iniciar`, `completar`, `cancelar`)
- `MotivoCancelacion`: string opcional, obligatorio si `Accion` es `cancelar`

## 8. Lógica de negocio 

### Servicio `TareaService`

- Convierte entidades `Tarea` a `TareaDto`.
- Usa repositorio para CRUD.
- En creación asigna un usuario por defecto obtenido de la tabla `Usuario`.
- Validación de cambios de estado:
  - `iniciar`: solo si estado era `Pendiente`
  - `completar`: no puede estar ya `Completada` ni `Cancelada`
  - `cancelar`: pone motivo y cambia a `Cancelada`

## 9. Repositorio y acceso a datos

### `TareaRepositorio`

- `ObtenerTodasAsync()` → lista completa, sin tracking
- `ObtenerPorIdAsync(Guid id)` → buscar por id
- `CrearAsync(Tarea tarea)` → agrega y guarda
- `ActualizarAsync(Tarea tarea)` → guarda cambios en entidad tracked
- `EliminarAsync(Guid id)` → borra si existe
- `ObtenerUsuarioDefaultIdAsync()` → obtiene primer usuario registrado

## 10. Inicialización de la base de datos

El script `sql/esquema_sencillo.sql` crea:
- Base de datos `GestorTareasSimple`
- Tablas `Usuario` y `Tarea`
- Relaciones y validaciones básicas
- Datos de ejemplo para un usuario y varias tareas

### Notas de inicialización

- Debe existir al menos un usuario para crear nuevas tareas.
- El usuario por defecto se obtiene en `TareaService.CrearAsync()`.

## 11. Consideraciones para el frontend

- El backend expone una API REST simple basada en tareas.
- El frontend debe enviar JSON con `Prioridad` como nombre de enum: `Baja`, `Media`, `Alta`.
- Para cambiar estado, enviar la acción exacta en minúsculas: `iniciar`, `completar`, `cancelar`.
- CORS ya está habilitado para `http://localhost:4200`.
- Swagger está disponible para explorar la API cuando el backend esté corriendo.

## 12. Archivo creado

- `BACKEND_SUMMARY.md`
