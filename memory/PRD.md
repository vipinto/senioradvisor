# SeniorAdvisor - PRD

## Descripción
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactándose directamente. El equipo sube la base de datos; las residencias pueden reclamar su ficha o registrarse. Una residencia puede agregar sucursales.

## Funcionalidades Implementadas
- Búsqueda de residencias con filtros
- Perfil detallado con fotos, amenidades, precios por 3 categorías
- Sistema de reseñas y ratings (5 criterios)
- Registro público multi-paso (6 pasos) con aprobación admin
- Sucursales: cada residencia puede agregar hasta 5 ubicaciones adicionales
- **Solicitud de Servicio (NUEVO)**: Formulario 3 pasos para que familias publiquen lo que necesitan (tipo servicio, datos paciente, habitación, necesidades especiales, urgencia, presupuesto, comuna, descripción)
- Dashboard proveedor: perfil, galería, amenidades, servicios, sucursales
- Admin panel: gestión completa
- Carga masiva CSV optimizada
- Blog, SeniorClub (convenios)
- Branding 100% SeniorAdvisor

## Credenciales
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps (bloqueado por billing del usuario)
- Paginación en resultados de búsqueda
- Autocompletado comuna/región en búsqueda
- Refactoring de componentes grandes

## Key API Endpoints
- POST /api/auth/register-provider - Registro público de residencia
- GET/POST/DELETE /api/providers/my-branches - CRUD sucursales
- POST /api/care-requests - Crear solicitud de servicio (paciente, necesidades, presupuesto)
- GET /api/care-requests/my-requests - Mis solicitudes
- GET /api/providers - Búsqueda pública
- PUT /api/my-profile - Actualizar perfil proveedor
