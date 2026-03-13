# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores.

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Puede buscar servicios, publicar solicitudes, enviar mensajes
- **Proveedor de Servicios**: Puede ofrecer residencias, cuidado a domicilio o servicios de salud mental
- **Admin**: Panel de administración

### Categorías de Servicios
- **Residencias**: Hogares especializados con atención 24/7
- **Cuidado a Domicilio**: Cuidadores profesionales que van al hogar
- **Salud Mental**: Psicólogos, psiquiatras y terapeutas especializados

## Funcionalidades

### Para Clientes/Familiares
- Buscar servicios por zona/tipo
- Publicar solicitudes de cuidado
- Ver perfiles de proveedores
- Sistema de favoritos
- Chat con proveedores
- Historial de servicios

### Para Proveedores
- Panel de proveedor con estadísticas
- Recibir y responder solicitudes
- Galería de fotos
- Configurar zonas de servicio
- Calendario de disponibilidad

## Key API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Registro
- GET /api/auth/me - Usuario actual
- GET /api/providers - Listar proveedores
- GET /api/providers/{id} - Perfil de proveedor
- POST /api/care-requests - Crear solicitud
- GET /api/chat/messages - Mensajes

## Arquitectura

### Frontend
- React con react-router-dom
- TailwindCSS
- Shadcn UI components
- Google Maps integration

### Backend
- FastAPI (Python)
- MongoDB
- JWT authentication
- Socket.IO para chat

## Credenciales Configuradas
- MongoDB: senioradvisor.jlwmjmj.mongodb.net
- Google OAuth: Configurado para senioradvisor.cl
- Google Maps: Configurado
- Resend Email: Configurado

## Dominio
- senioradvisor.cl

## Última Actualización
Julio 2025 - Proyecto inicializado, credenciales configuradas, branding actualizado.
