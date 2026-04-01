# SeniorAdvisor - PRD

## Descripcion
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactandose directamente.

## Funcionalidades Implementadas
- Busqueda con paginacion (20 por pagina) y autocompletado de comuna (34 comunas)
- Busqueda por nombre, direccion o comuna (query q con $or)
- Tab "Todos" en SearchBar para buscar en todas las categorias
- Perfil detallado con fotos, amenidades, precios por 3 categorias
- Sistema de resenas y ratings (5 criterios)
- Resenas de Google: se muestran en perfil publico (obtenidas via PlaceID)
- Mapa de ubicacion con coordenadas reales (obtenidas via PlaceID)
- Registro publico multi-paso (6 pasos) con aprobacion admin
- Seleccion de servicios con checkboxes (Residencias, Cuidado a Domicilio, Salud Mental)
- Sucursales: hasta 5 ubicaciones adicionales por residencia
- Solicitud de Servicio: formulario 3 pasos para familias
- Panel Residencia: Solicitudes Publicadas + Sucursales
- Mi Cuenta: Perfil, Precios, Servicios/Amenidades, Galeria, Redes Sociales
- Admin: Crear Residencia con PlaceID - obtiene coordenadas, rating y resenas automaticamente
- Admin panel completo con 9 tabs (Pendientes, Residencias, Planes, Metricas, Trafico/Leads, Blog, Leads, Convenios, Resenas)
- Toggle Destacado/Premium: is_featured -> is_featured_admin en DB
- Favoritos: boton Heart para clientes, pagina /favoritos
- Premium Gallery component
- Pagina Destacados
- SeniorClub con modal "Obtener Codigo" + boton "Visitar Sitio Web"
- Boton flotante WhatsApp en index.html
- Auto-fetch Google data al crear residencias (manual, bulk y Excel)
- Diagnostics endpoint (/api/diagnostics)
- Cloudinary routes (pendiente config de variables)
- Emails de contacto: hola@senioradvisor.cl

## Credenciales
- Admin: admin@senioradvisor.cl / EmiLuci2$$$
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Alineacion con PetAdvisor (Abril 2026)
- Todos los archivos alineados funcionalmente con PetAdvisor
- Solo diferencias de branding: colores (#00e7ff/#33404f vs #ffff00/#000000) y nombre
- 39 archivos actualizados

## Bugs Resueltos (Abril 2026)
1. Toggle Destacado/Premium no guardaba - FIXED (is_featured -> is_featured_admin)
2. Categorias Home horizontales en movil - FIXED (grid + flex responsive)
3. Boton favoritos faltante y texto incorrecto - FIXED
4. Metricas admin faltantes - FIXED (5 cards)
5. Fotos guardando localmente - CONFIRMADO
6. Aurum Senior Living sin rating/resenas - FIXED (4.7, 31 resenas de Google)
7. Emails de contacto actualizados a hola@senioradvisor.cl

## Pendiente / P1
- Configurar variables Cloudinary (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)

## Pendiente / P2
- Filtros avanzados de busqueda (precio, amenidades, rating minimo)

## Futuro / Backlog
- Refactorizar AdminPanel.jsx en componentes mas pequenos

## Key API Endpoints
- GET /api/providers - {results, total, skip, limit}
- GET /api/providers/{id} - incluye google_reviews, google_rating
- PUT /api/admin/providers/{id}/profile - allowed fields incluye is_featured, is_subscribed
- POST /api/admin/providers/{id}/toggle-featured
- POST /api/admin/providers/{id}/toggle-subscribed
- GET /api/admin/stats
- GET /api/admin/reviews
- GET /api/admin/leads
- GET /api/admin/leads/metrics
- GET /api/diagnostics
- POST/DELETE /api/favorites/{provider_id}
- GET /api/favorites

## Data Model - providers collection
- google_rating, google_total_reviews, google_reviews
- latitude, longitude, place_id
- is_featured_admin, is_subscribed, provider_is_subscribed
- verified, status
- services: array of {service_type, price_from, description}
