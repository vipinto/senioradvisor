# SeniorAdvisor - PRD

## Descripción
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactándose directamente.

## Funcionalidades Implementadas
- Búsqueda con **paginación** (20 por página) y **autocompletado de comuna** (34 comunas)
- Búsqueda por nombre, dirección o comuna (query `q` con `$or`)
- Búsqueda desde Home funciona por nombre (sin filtro de service_type automático)
- Perfil detallado con fotos, amenidades, precios por 3 categorías
- Sistema de reseñas y ratings (5 criterios)
- **Reseñas de Google**: se muestran en perfil público cuando existen (obtenidas via PlaceID)
- **Mapa de ubicación**: se muestra con coordenadas reales (obtenidas via PlaceID), con fallback a link de Google Maps
- Registro público multi-paso (6 pasos) con aprobación admin
- **Selección de servicios con checkboxes** (Residencias, Cuidado a Domicilio, Salud Mental) - en admin y registro público
- Sucursales: hasta 5 ubicaciones adicionales por residencia
- Solicitud de Servicio: formulario 3 pasos para familias (paciente, ubicación, detalles)
- Panel Residencia: solo Solicitudes Publicadas + Sucursales
- Mi Cuenta: Perfil, Precios, Servicios/Amenidades (grid 2 cols con iconos), Galería, Redes Sociales
- **Admin: Crear Residencia con PlaceID** → obtiene coordenadas, rating y reseñas de Google automáticamente
- Admin panel completo (sin límite de 200, muestra todos), carga masiva CSV, Blog, SeniorClub
- Branding 100% SeniorAdvisor
- **Perfil Proveedor con modo admin/owner**: hero cyan para TODOS los usuarios, barra admin + botones "Editar" solo para admin/dueño, placeholders para contenido vacío (slider, video, servicios), galería premium debajo del hero

## Credenciales
- Admin: admin@senioradvisor.cl / EmiLuci2$$$
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente / P1
- Galería: limitar a 3 fotos estándar + Slider Premium (10 fotos, solo suscriptores)

## Pendiente / P2
- Google Maps billing (la API key del usuario no tiene billing activo)
- Filtros avanzados de búsqueda (precio, amenidades, rating mínimo)

## Futuro / Backlog
- Refactorizar AdminPanel.jsx (componentes más pequeños)

## Key API Endpoints
- GET /api/providers → {results, total, skip, limit} (paginado, q param)
- GET /api/providers/comunas → array de comunas para autocompletado
- GET /api/providers/{id} → incluye google_reviews, google_rating, google_total_reviews, latitude, longitude
- POST /api/admin/residencias/create → acepta latitude, longitude, google_rating, google_total_reviews, google_reviews, services con active flag
- GET /api/admin/google-place/{place_id} → obtener datos de Google Places
- POST /api/admin/providers/{id}/refresh-google → refrescar datos de Google para proveedor existente
- POST /api/auth/register-provider
- GET/POST/DELETE /api/providers/my-branches
- POST /api/care-requests

## Data Model - providers collection
- google_rating: float (0-5)
- google_total_reviews: int
- google_reviews: array of {author_name, rating, text, relative_time_description, profile_photo_url}
- latitude: float
- longitude: float
- place_id: string
- services: array of {service_type, price_from, description}
