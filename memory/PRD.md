# U-CAN - Directorio de Cuidadores de Mascotas

## Problema Original
Plataforma web para encontrar cuidadores de mascotas con sistema de suscripciones premium.

## Modelo de Negocio (RESTAURADO)

### Roles
- **Cliente**: Puede buscar cuidadores, publicar solicitudes de cuidado, enviar mensajes
- **Cuidador (Provider)**: Puede recibir solicitudes, responder a clientes, gestionar reservas
- **Admin**: Panel de administración

### Sistema de Suscripciones
- Cliente Premium ($9.990/mes): Acceso completo a funcionalidades
- Cuidador Premium ($7.500/mes): Destacado en búsquedas, SOS emergencia

## Funcionalidades

### Para Clientes
- Buscar cuidadores por zona/servicio
- Publicar solicitudes de cuidado
- Ver perfiles de cuidadores
- Sistema de favoritos
- Chat con cuidadores
- Gestión de mascotas
- Historial de servicios

### Para Cuidadores
- Panel de cuidador con estadísticas
- Recibir y responder solicitudes
- Galería de fotos
- Configurar zonas de servicio
- "Más Datos" - información personal y fotos
- Calendario de disponibilidad

## Key API Endpoints
- POST /api/auth/login - Login
- POST /api/auth/register - Registro
- GET /api/auth/me - Usuario actual
- GET /api/providers - Listar cuidadores
- GET /api/providers/{id} - Perfil de cuidador
- POST /api/care-requests - Crear solicitud
- GET /api/chat/messages - Mensajes
- POST /api/bookings - Crear reserva

## Funcionalidades Completadas (10 Marzo 2026)

### Sistema Multi-Rol
- [x] Usuario puede tener roles "client" y "provider" simultáneamente
- [x] Pantalla de selección de rol (`/select-role`) al iniciar sesión
- [x] Dashboards separados por rol (Mi Cuenta + Panel)

### Privacidad de Datos del Cuidador
- [x] Datos sensibles (teléfono, dirección, WhatsApp, email) ocultos por defecto
- [x] Solo se revelan cuando el cuidador acepta solicitud de contacto
- [x] Comuna siempre visible (información pública)
- [x] Flags en API: `contact_blocked`, `viewer_is_connected`, `contact_message`

### UX Multi-Rol
- [x] Ocultar "¿Quieres ser Cuidador?" en Panel Cliente si el usuario ya tiene rol de provider

### Sistema de Perfil Completo para Cuidadores
- [x] Checklist de completitud del perfil visible en Panel del Cuidador
- [x] Barra de progreso que muestra porcentaje de completitud
- [x] Secciones requeridas: Mi Perfil, Más Datos, Galería (1+ foto), Zonas, Disponibilidad, Servicios (1+)
- [x] Foto de perfil es recomendada pero no obligatoria
- [x] Solo cuidadores con perfil 100% completo aparecen en búsquedas públicas
- [x] Badge verde cuando el perfil está completo

### Foto de Perfil del Cuidador
- [x] Endpoint `POST /api/providers/my-profile/photo` para subir foto
- [x] UI en Mi Cuenta > Mi Perfil con botón de cámara
- [x] Foto visible en perfil público del cuidador

## Tareas Pendientes

### P1
- [ ] Calcular precio total según fechas de reserva

### P2 (Backlog)
- [ ] Certificaciones adicionales para cuidadores
- [ ] Modelo de comisiones
- [ ] Refactorizar componentes grandes
- [ ] Investigar causa raíz de inestabilidad del build frontend

## Issues Conocidos
- Google Maps: Error en mapa de ubicación (configuración externa de API key)
- Build Frontend: Workaround activo en craco.config.js

## Credenciales de Prueba
- Admin: admin@test.com / password123
- Cuidador: cuidador@test.com / cuidador123
- Cliente Premium: cliente@test.com / cliente123
- Cliente Free: test_client_ui@test.com / test123456

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

## Ultima Actualización
10 Marzo 2026 - Sistema de perfil completo implementado. Los cuidadores deben completar todas las secciones (Mi Perfil, Más Datos, Galería, Zonas, Disponibilidad, Servicios) para aparecer en las búsquedas públicas. Se agregó funcionalidad para subir foto de perfil.
