# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores. Transformada desde la app "U-CAN".

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Buscar servicios, ver perfiles, dejar reseñas (SIN suscripción)
- **Proveedor**: Ofrece residencias, cuidado a domicilio o salud mental. Suscripción Premium via MercadoPago
- **Admin**: Panel de administración

### Categorías
- Residencias | Cuidado a Domicilio | Salud Mental

### Planes de Suscripción (Proveedores - MercadoPago Producción)
- Mensual: $19.990 CLP | Trimestral: $49.990 CLP | Anual: $149.990 CLP

## Funcionalidades Implementadas

### Home
- Hero con buscador
- Banner de llamado a la acción
- Nuestros Servicios (3 categorías)
- **Residencias Destacadas** (4 mejores evaluados con foto, rating, comuna)
- Sobre Nosotros
- CTA para proveedores

### Perfil del Proveedor (orden de secciones)
- Hero: fondo #00e7ff, nombre en #33404f, comuna bold
- Rating: estrellas amarillas arriba de galería
- Galería: fotos del proveedor
- Sobre mi: descripción
- Servicios: amenidades en 4 categorías (Cuidado y Salud, Servicios e instalaciones, Habitaciones, Actividades)
- Más Información
- Reseñas: con mensaje de login si no está autenticado
- **Sidebar**: Redes sociales (Instagram, Facebook, Web - círculos #33404f, iconos blancos, hover #00e7ff), Precio, Contacto, Ubicación, CTA para dueños

### Panel del Proveedor
- Suscripción Premium (MercadoPago)
- Tab Servicios: toggles de amenidades + redes sociales
- Galería, Reservas, Solicitudes

### Sistema de Reseñas
- 5 criterios: personal, instalaciones, visitas, comida, actividades
- Promedio automático
- Requiere login para dejar reseña

## Key API Endpoints
- POST /api/auth/login, /register | GET /api/auth/me
- GET /api/providers | GET /api/providers/{id}
- PUT /api/providers/my-profile (amenities, social_links)
- POST /api/reviews
- GET /api/subscription/plans?role=provider
- POST /api/subscription/create-payment
- POST /api/webhooks/mercadopago

## Credenciales de Test
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Estado Actual (Marzo 2026)

### Completado
- Re-branding U-CAN → SeniorAdvisor
- Categorías de servicios actualizadas
- Sistema de reseñas 5 criterios
- Eliminación paywall clientes
- MercadoPago producción (3 planes)
- Amenidades con 4 categorías + toggles en dashboard
- Redes sociales (Instagram, Facebook, Web) en perfil + dashboard
- Residencias Destacadas en Home
- CTA para dueños en perfil
- Fotos actualizadas en todos los providers
- 5 reseñas seed en Villa Serena

### Pendiente
- P1: Google Maps (desactivado, requiere config externa)
- P2: Limpieza global terminología ("cuidador"/"mascota")
- P2: Optimización modelo de datos

## Dominio
- senioradvisor.cl
