# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores. Transformada desde la app "U-CAN" (directorio de pet-sitters).

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Puede buscar servicios, ver perfiles, dejar reseñas (SIN suscripción requerida)
- **Proveedor de Servicios**: Ofrece residencias, cuidado a domicilio o salud mental. Puede suscribirse a plan Premium via MercadoPago
- **Admin**: Panel de administración

### Categorías de Servicios
- **Residencias**: Hogares especializados con atención 24/7
- **Cuidado a Domicilio**: Cuidadores profesionales que van al hogar
- **Salud Mental**: Psicólogos, psiquiatras y terapeutas especializados

### Planes de Suscripción (Proveedores)
- **Plan Mensual**: $19.990 CLP/mes
- **Plan Trimestral**: $49.990 CLP ($16.663/mes)
- **Plan Anual**: $149.990 CLP ($12.499/mes)
- Pago via MercadoPago (modo producción)

## Funcionalidades Implementadas

### Para Clientes/Familiares
- Buscar servicios por zona/tipo (3 categorías)
- Ver perfiles de proveedores (sin paywall)
- Sistema de reseñas con 5 criterios (personal, instalaciones, visitas, comida, actividades)
- Contacto con proveedores vía chat
- Login con email/password y Google OAuth

### Para Proveedores
- Panel de proveedor con estadísticas
- Suscripción Premium via MercadoPago (3 planes)
- Galería de fotos
- Perfil público con servicios y precios
- Gestión de solicitudes de contacto

## Key API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Registro
- GET /api/auth/me - Usuario actual
- GET /api/providers - Listar proveedores
- GET /api/providers/{id} - Perfil de proveedor
- POST /api/reviews - Crear reseña
- POST /api/contact-requests - Solicitar contacto
- GET /api/subscription/plans?role=provider - Planes de suscripción
- POST /api/subscription/create-payment - Crear pago MercadoPago
- POST /api/webhooks/mercadopago - Webhook de MercadoPago
- GET /api/subscription/my - Mi suscripción
- GET /api/subscription/verify/{id} - Verificar pago

## Arquitectura

### Frontend
- React con react-router-dom
- TailwindCSS + Shadcn UI
- Google Maps (DESACTIVADO - SafeMap placeholder)

### Backend
- FastAPI (Python)
- MongoDB Atlas
- JWT authentication
- MercadoPago SDK (v2.3.0) - producción
- Socket.IO para chat

## Credenciales de Test
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Estado Actual (Marzo 2026)

### Completado
- Re-branding completo U-CAN → SeniorAdvisor
- Categorías de servicios actualizadas
- Sistema de reseñas con 5 criterios
- Eliminación de paywall para clientes
- 10 proveedores de ejemplo en base de datos
- Accesibilidad mejorada (fuentes grandes, alto contraste)
- Fix error de sintaxis en ProviderProfile.jsx
- **MercadoPago para proveedores** (3 planes, modo producción)
- SubscriptionCard actualizado para proveedores
- PaymentResult actualizado para contexto de proveedores

### Pendiente
- P1: Google Maps (desactivado, requiere configuración externa)
- P2: Limpieza global de terminología ("U-CAN", "mascota", "cuidador")
- P2: Optimización del modelo de datos de proveedores
- P2: Limpieza del ProviderDashboard (referencias a mascotas)

## 3rd Party Integrations
- MongoDB Atlas: Base de datos
- Google OAuth: Autenticación
- Google Maps: DESACTIVADO
- Resend: Email
- MercadoPago: Pagos de suscripción (PRODUCCIÓN)

## Dominio
- senioradvisor.cl
