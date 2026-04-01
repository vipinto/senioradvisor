# SeniorAdvisor - PRD

## Descripcion
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactandose directamente.

## Funcionalidades Implementadas
- Busqueda con **paginacion** (20 por pagina) y **autocompletado de comuna** (34 comunas)
- Busqueda por nombre, direccion o comuna (query `q` con `$or`)
- Busqueda desde Home funciona por nombre (sin filtro de service_type automatico)
- Perfil detallado con fotos, amenidades, precios por 3 categorias
- Sistema de resenas y ratings (5 criterios)
- **Resenas de Google**: se muestran en perfil publico cuando existen (obtenidas via PlaceID)
- **Mapa de ubicacion**: se muestra con coordenadas reales (obtenidas via PlaceID), con fallback a link de Google Maps
- Registro publico multi-paso (6 pasos) con aprobacion admin
- **Seleccion de servicios con checkboxes** (Residencias, Cuidado a Domicilio, Salud Mental) - en admin y registro publico
- Sucursales: hasta 5 ubicaciones adicionales por residencia
- Solicitud de Servicio: formulario 3 pasos para familias (paciente, ubicacion, detalles)
- Panel Residencia: solo Solicitudes Publicadas + Sucursales
- Mi Cuenta: Perfil, Precios, Servicios/Amenidades (grid 2 cols con iconos), Galeria, Redes Sociales
- **Admin: Crear Residencia con PlaceID** - obtiene coordenadas, rating y resenas de Google automaticamente
- Admin panel completo (sin limite de 200, muestra todos), carga masiva CSV, Blog, SeniorClub
- Branding 100% SeniorAdvisor
- **Perfil Proveedor con modo admin/owner**: hero cyan para TODOS los usuarios, barra admin + botones "Editar" solo para admin/dueno, placeholders para contenido vacio (slider, video, servicios), galeria premium debajo del hero
- **Admin Panel con 6 metricas**: Usuarios, Residencias, Pendientes, Verificados, Suscripciones, Resenas
- **Toggle Destacado/Premium funcional**: is_featured e is_subscribed se guardan correctamente desde el modal admin
- **Favoritos**: boton Heart visible para clientes, pagina /favoritos con texto correcto
- **Mobile responsive**: categorias de Home y SearchBar se muestran verticalmente en movil

## Credenciales
- Admin: admin@senioradvisor.cl / EmiLuci2$$$
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Bugs Resueltos (Abril 2026)
1. Toggle Destacado/Premium no guardaba desde modal admin - FIXED (backend allowed fields + sync)
2. Categorias Home horizontales en movil - FIXED (grid-cols-1 + flex-col sm:flex-row)
3. Boton favoritos faltante y texto incorrecto - FIXED (isClient condition works, text updated)
4. Metricas admin faltantes - FIXED (6 cards incluyendo Resenas)
5. Fotos guardando localmente - CONFIRMADO como comportamiento esperado

## Pendiente / P1
- Galeria: limitar a 3 fotos estandar + Slider Premium (10 fotos, solo suscriptores)

## Pendiente / P2
- Google Maps billing (la API key del usuario no tiene billing activo)
- Filtros avanzados de busqueda (precio, amenidades, rating minimo)

## Futuro / Backlog
- Refactorizar AdminPanel.jsx (componentes mas pequenos)
- Integracion Cloudinary para almacenamiento de imagenes (actualmente local)

## Key API Endpoints
- GET /api/providers - {results, total, skip, limit} (paginado, q param)
- GET /api/providers/comunas - array de comunas para autocompletado
- GET /api/providers/{id} - incluye google_reviews, google_rating, google_total_reviews, latitude, longitude
- PUT /api/admin/providers/{id}/profile - acepta is_featured, is_subscribed, provider_is_subscribed, verified
- GET /api/admin/stats - retorna total_users, total_providers, pending_providers, verified_providers, active_subscriptions, total_reviews
- POST/DELETE /api/favorites/{provider_id} - agregar/quitar favoritos
- GET /api/favorites - listar favoritos del usuario
- GET /api/favorites/check/{provider_id} - verificar si es favorito

## Data Model - providers collection
- google_rating: float (0-5)
- google_total_reviews: int
- google_reviews: array of {author_name, rating, text, relative_time_description, profile_photo_url}
- latitude: float
- longitude: float
- place_id: string
- is_featured: boolean
- is_subscribed: boolean
- provider_is_subscribed: boolean
- verified: boolean
- services: array of {service_type, price_from, description}
