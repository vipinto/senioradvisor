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
- Favoritos: boton Heart para clientes, pagina /favoritos
- Premium Gallery component
- Pagina Destacados
- SeniorClub con modal "Obtener Codigo" + boton "Visitar Sitio Web"
- Boton flotante WhatsApp en index.html
- Auto-fetch Google data al crear residencias (manual, bulk y Excel)
- Diagnostics endpoint (/api/diagnostics)
- Cloudinary routes (pendiente config de variables)
- Emails de contacto: hola@senioradvisor.cl

## Sistema de Planes (Abril 2026)
- Eliminada gestion de suscripciones self-managed (MercadoPago)
- 3 planes comerciales manejados por admin via AdminEditModal:
  - **Premium+**: Corona dorada, todas las funciones (YouTube, Slider Premium, Redes Sociales)
  - **Premium**: Badge cyan, funciones intermedias (Chat Directo, Amenidades, Presencia Destacados)
  - **Destacado**: Badge gris, funciones basicas (Galeria, Precios, Ubicacion, Sobre mi)
- Orden de aparicion: Premium+ -> Premium -> Destacado -> resto
- Admin puede cambiar email y password de residencias desde AdminEditModal
- Campos no habilitados por plan estan bloqueados/read-only en ProviderAccount
- /auth/me devuelve has_subscription basado en plan_type (Premium/Premium+ = true)
- Estadisticas admin muestran "Planes Activos" en vez de "Suscripciones"

## Credenciales
- Admin: admin@senioradvisor.cl / EmiLuci2$$$
- Cliente: demo@senioradvisor.cl / demo123

## Permisos por Plan
| Funcion | Destacado | Premium | Premium+ |
|---|---|---|---|
| Galeria | Si | Si | Si |
| Precios | Si | Si | Si |
| Sobre mi / Ubicacion | Si | Si | Si |
| Amenidades | No | Si | Si |
| Chat Directo (tel/whatsapp) | No | Si | Si |
| Presencia Destacados (Home) | No | Si | Si |
| Sello Verificado | No | Si | Si |
| Video YouTube | No | No | Si |
| Slider Premium | No | No | Si |
| Redes Sociales | No | No | Si |

## Key API Endpoints
- GET /api/providers - {results, total, skip, limit} (ordenado por plan_type)
- GET /api/providers/{id} - incluye google_reviews, google_rating
- PUT /api/admin/providers/{id}/profile - plan_type, plan_active, verified, etc.
- PUT /api/admin/providers/{id}/credentials - email, password
- POST /api/admin/providers/{id}/toggle-featured
- GET /api/admin/stats - incluye active_subscriptions (ahora cuenta planes activos)
- POST/DELETE /api/favorites/{provider_id}
- GET /api/favorites

## Data Model - providers collection
- plan_type: '' | 'destacado' | 'premium' | 'premium_plus'
- plan_active: boolean
- verified: boolean
- google_rating, google_total_reviews, google_reviews
- latitude, longitude, place_id
- is_featured_admin
- services: array of {service_type, price_from, description}

## Pendiente / P1
- Configurar variables Cloudinary (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)

## Pendiente / P2
- Purgar rutas de suscripcion del backend (MercadoPago routes, subscription endpoints)
- Limpiar ServiceHistory.jsx y PlansSimple.jsx (obsoletos)
- Filtros avanzados de busqueda (precio, amenidades, rating minimo)

## Futuro / Backlog
- Refactorizar AdminPanel.jsx en componentes mas pequenos
- Eliminar SubscriptionCard.jsx
