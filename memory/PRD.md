# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores. Transformada desde la app "U-CAN" (directorio de pet-sitters).

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Puede buscar servicios, publicar solicitudes, enviar mensajes (SIN suscripción requerida)
- **Proveedor de Servicios**: Puede ofrecer residencias, cuidado a domicilio o servicios de salud mental
- **Admin**: Panel de administración

### Categorías de Servicios
- **Residencias**: Hogares especializados con atención 24/7
- **Cuidado a Domicilio**: Cuidadores profesionales que van al hogar
- **Salud Mental**: Psicólogos, psiquiatras y terapeutas especializados

## Funcionalidades Implementadas

### Para Clientes/Familiares
- Buscar servicios por zona/tipo (3 categorías)
- Ver perfiles de proveedores (sin paywall)
- Sistema de reseñas con 5 criterios (personal, instalaciones, visitas, comida, actividades)
- Contacto con proveedores vía chat
- Login con email/password y Google OAuth

### Para Proveedores
- Panel de proveedor con estadísticas
- Galería de fotos
- Perfil público con servicios y precios

## Key API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Registro
- GET /api/auth/me - Usuario actual
- GET /api/providers - Listar proveedores (filtros: service_type, comuna)
- GET /api/providers/{id} - Perfil de proveedor
- POST /api/reviews - Crear reseña con 5 criterios
- POST /api/contact-requests - Solicitar contacto

## Arquitectura

### Frontend
- React con react-router-dom
- TailwindCSS + Shadcn UI
- Google Maps (DESACTIVADO temporalmente - SafeMap placeholder)

### Backend
- FastAPI (Python)
- MongoDB Atlas (senioradvisor.jlwmjmj.mongodb.net)
- JWT authentication
- Socket.IO para chat

## Credenciales de Test
- Email: demo@senioradvisor.cl
- Password: demo123

## Estado Actual (Marzo 2026)

### Completado
- Re-branding completo U-CAN → SeniorAdvisor
- Categorías de servicios actualizadas
- Sistema de reseñas con 5 criterios
- Eliminación de paywall para clientes
- 10 proveedores de ejemplo en base de datos
- Accesibilidad mejorada (fuentes grandes, alto contraste)
- Fix de error de sintaxis en ProviderProfile.jsx (líneas residuales eliminadas)

### Pendiente
- P1: Google Maps (desactivado, requiere configuración externa del usuario)
- P1: MercadoPago para suscripciones de proveedores (esperando credenciales)
- P2: Limpieza global de terminología (buscar "U-CAN", "mascota", "cuidador")
- P2: Optimización del modelo de datos de proveedores

## Dominio
- senioradvisor.cl
