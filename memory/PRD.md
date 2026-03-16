# SeniorAdvisor - PRD

## Descripción
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactándose directamente.

## Funcionalidades Implementadas
- Búsqueda con **paginación** (20 por página) y **autocompletado de comuna** (34 comunas)
- Perfil detallado con fotos, amenidades, precios por 3 categorías
- Sistema de reseñas y ratings (5 criterios)
- Registro público multi-paso (6 pasos) con aprobación admin
- Sucursales: hasta 5 ubicaciones adicionales por residencia
- Solicitud de Servicio: formulario 3 pasos para familias (paciente, ubicación, detalles)
- Panel Residencia: solo Solicitudes Publicadas + Sucursales
- Mi Cuenta: Perfil, Precios, Servicios/Amenidades (grid 2 cols con iconos), Galería, Redes Sociales
- Admin panel completo, carga masiva CSV, Blog, SeniorClub
- Branding 100% SeniorAdvisor

## Credenciales
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps (bloqueado por billing del usuario)

## Key API Endpoints
- GET /api/providers → {results, total, skip, limit} (paginado)
- GET /api/providers/comunas → array de comunas para autocompletado
- POST /api/auth/register-provider
- GET/POST/DELETE /api/providers/my-branches
- POST /api/care-requests
- PUT /api/providers/my-profile/amenities
- PUT /api/providers/my-profile/social
