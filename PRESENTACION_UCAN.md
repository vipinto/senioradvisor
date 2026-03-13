# U-CAN - Plataforma de Cuidadores de Mascotas
## Documento de Presentación Ejecutiva

---

## 🎯 Resumen Ejecutivo

**U-CAN** es una plataforma web completa que conecta dueños de mascotas con cuidadores profesionales. Permite buscar, comparar y reservar servicios de cuidado animal como paseos, hospedaje y pet-sitting.

---

## 👥 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| **Cliente** | Dueños de mascotas que buscan servicios |
| **Cuidador** | Profesionales que ofrecen servicios de cuidado |
| **Administrador** | Gestión de la plataforma |

---

## 🖥️ FRONTEND - Funcionalidades por Página

### 1. Páginas Públicas

| Página | Funcionalidad |
|--------|---------------|
| **Home** | Landing page con búsqueda rápida, tipos de servicio (Alojamiento, PetSitter, Paseo), selector de fechas |
| **Buscar Servicios** | Búsqueda avanzada con filtros, mapa interactivo con ubicación de cuidadores, lista de resultados con ratings |
| **Perfil de Cuidador** | Información completa del cuidador, servicios ofrecidos con precios, reseñas con fotos, mapa de ubicación, botón de reserva |
| **Planes/Suscripción** | Planes de suscripción disponibles, precios y beneficios, integración de pago con Mercado Pago |
| **FAQ** | Preguntas frecuentes organizadas |
| **Términos y Condiciones** | Información legal de la plataforma |

### 2. Autenticación

| Página | Funcionalidad |
|--------|---------------|
| **Iniciar Sesión** | Login con email/contraseña, Login con Google OAuth, Enlace a recuperar contraseña |
| **Registro** | Selección de tipo de cuenta (Cliente/Cuidador), Formulario de registro, Registro con Google OAuth |
| **Recuperar Contraseña** | Envío de email de recuperación |
| **Restablecer Contraseña** | Formulario para nueva contraseña |

### 3. Panel del Cliente

| Página | Funcionalidad |
|--------|---------------|
| **Dashboard** | Resumen de cuenta, Estado de suscripción, Accesos rápidos (Favoritos, Reservas, Mensajes, Mascotas), Mis calificaciones recibidas |
| **Mis Mascotas** | Agregar/editar/eliminar mascotas, Datos: nombre, especie, raza, tamaño, edad, sexo, foto, notas |
| **Mis Reservas** | Lista de todas las reservas, Filtros por estado (Pendientes, Confirmadas, Completadas), Cancelar reservas, Ver detalles y perfil del cuidador |
| **Favoritos** | Lista de cuidadores guardados |
| **Chat/Mensajes** | Conversaciones en tiempo real con cuidadores, Indicador de "escribiendo...", Historial de mensajes |

### 4. Panel del Cuidador

| Página | Funcionalidad |
|--------|---------------|
| **Dashboard Cuidador** | Estadísticas (Rating, Reseñas, Servicios), Gestión de reservas con tabs |
| **Tab: Reservas** | Ver solicitudes pendientes, Confirmar/Rechazar reservas, Ver info de mascotas del cliente, Marcar como completadas, Estadísticas de reservas |
| **Tab: Disponibilidad** | Modo "Siempre activo", Calendario para seleccionar días disponibles |
| **Tab: Reseñas** | Ver reseñas recibidas con fotos |
| **Tab: Calificar Clientes** | Sistema de reseña bidireccional, Calificaciones: General, Puntualidad, Mascota, Comunicación |
| **Registro de Cuidador** | Formulario completo de perfil, Servicios ofrecidos con precios, Autocompletado de dirección con Google Places |
| **Botón SOS** | Llamada de emergencia a veterinario (configurable por admin) |

### 5. Panel de Administración

| Sección | Funcionalidad |
|---------|---------------|
| **Dashboard** | Métricas generales, Gráficos de nuevos usuarios, suscripciones |
| **Cuidadores** | Lista de cuidadores, Aprobar/Rechazar solicitudes, Verificar cuidadores |
| **Planes** | CRUD de planes de suscripción, Configurar precios y duración |
| **SOS** | Configurar número de emergencia, Horarios de atención, Activar/Desactivar servicio |

### 6. Componentes Globales

| Componente | Funcionalidad |
|------------|---------------|
| **Navbar** | Logo con enlace a home, Navegación principal, Menú de usuario con foto, Notificaciones |
| **Footer** | Enlaces a redes sociales, Enlaces a FAQ y Términos |
| **Notificaciones** | Campana con contador, Lista de notificaciones en tiempo real |

---

## ⚙️ BACKEND - APIs y Funcionalidades

### 1. Autenticación (`/api/auth/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/register` | POST | Registro de nuevo usuario |
| `/login` | POST | Inicio de sesión |
| `/me` | GET | Obtener usuario actual |
| `/google` | GET | Iniciar OAuth con Google |
| `/google/callback` | GET | Callback de Google OAuth |
| `/forgot-password` | POST | Solicitar recuperación |
| `/reset-password` | POST | Restablecer contraseña |
| `/profile/upload-photo` | POST | Subir foto de perfil |

### 2. Cuidadores (`/api/providers/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/providers` | GET | Buscar cuidadores con filtros |
| `/providers` | POST | Crear perfil de cuidador |
| `/providers/{id}` | GET | Obtener detalle de cuidador |
| `/providers/{id}` | PUT | Actualizar perfil |
| `/providers/my-profile` | GET | Mi perfil de cuidador |
| `/providers/my-profile` | PUT | Actualizar mi perfil |
| `/providers/my-services` | PUT | Actualizar mis servicios |
| `/providers/{id}/services` | GET | Servicios de un cuidador |
| `/provider/requests` | GET | Solicitudes recibidas |
| `/provider/reviews` | GET | Mis reseñas |

### 3. Reservas (`/api/bookings/*`) ⭐ NUEVO

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/bookings` | POST | Crear nueva reserva |
| `/bookings/my` | GET | Mis reservas (cliente) |
| `/bookings/provider` | GET | Reservas recibidas (cuidador) |
| `/bookings/{id}` | GET | Detalle de reserva |
| `/bookings/{id}/respond` | PUT | Confirmar/Rechazar reserva |
| `/bookings/{id}/cancel` | PUT | Cancelar reserva |
| `/bookings/{id}/complete` | PUT | Marcar como completada |
| `/bookings/stats/summary` | GET | Estadísticas de reservas |

### 4. Suscripciones (`/api/subscription/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/subscription/plans` | GET | Listar planes disponibles |
| `/subscription/my` | GET | Mi suscripción actual |
| `/subscription/create` | POST | Crear suscripción (Mercado Pago) |
| `/subscription/webhook` | POST | Webhook de Mercado Pago |

### 5. Social/Reseñas (`/api/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/favorites` | GET | Mis favoritos |
| `/favorites/{id}` | POST | Agregar favorito |
| `/favorites/{id}` | DELETE | Quitar favorito |
| `/reviews` | POST | Crear reseña a cuidador |
| `/reviews/client` | POST | Cuidador califica cliente |
| `/reviews/client/me` | GET | Mis calificaciones como cliente |
| `/reviews/provider/given` | GET | Calificaciones que he dado |
| `/reviews/upload-photo` | POST | Subir foto para reseña |
| `/providers/{id}/reviews` | GET | Reseñas de un cuidador |

### 6. Chat (`/api/chat/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/chat/conversations` | GET | Mis conversaciones |
| `/chat/messages/{id}` | GET | Mensajes de conversación |
| `/chat/messages` | POST | Enviar mensaje |
| **WebSocket** | - | Mensajes en tiempo real |

### 7. Mascotas (`/api/pets/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/pets` | GET | Mis mascotas |
| `/pets` | POST | Agregar mascota |
| `/pets/{id}` | DELETE | Eliminar mascota |
| `/pets/upload-photo` | POST | Subir foto de mascota |

### 8. Notificaciones (`/api/notifications/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/notifications` | GET | Mis notificaciones |
| `/notifications/{id}/read` | PUT | Marcar como leída |
| `/notifications/read-all` | PUT | Marcar todas como leídas |

### 9. Administración (`/api/admin/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/providers` | GET | Listar cuidadores |
| `/admin/providers/{id}/approve` | PUT | Aprobar cuidador |
| `/admin/providers/{id}/reject` | PUT | Rechazar cuidador |
| `/admin/providers/{id}/verify` | PUT | Verificar cuidador |
| `/admin/plans` | GET | Listar planes |
| `/admin/plans` | POST | Crear plan |
| `/admin/plans/{id}` | PUT | Actualizar plan |
| `/admin/plans/{id}` | DELETE | Eliminar plan |
| `/admin/sos` | GET | Configuración SOS |
| `/admin/sos` | PUT | Actualizar SOS |
| `/admin/stats` | GET | Estadísticas generales |

### 10. Otros (`/api/*`)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado del servidor |
| `/sos/info` | GET | Info SOS para cuidadores |

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **React** - Framework de UI
- **TailwindCSS** - Estilos
- **Shadcn/UI** - Componentes de interfaz
- **React Router** - Navegación
- **Socket.IO Client** - Chat en tiempo real
- **Google Maps API** - Mapas y autocompletado
- **Recharts** - Gráficos en admin

### Backend
- **FastAPI** - Framework API REST
- **Python 3.11** - Lenguaje
- **MongoDB** - Base de datos
- **Socket.IO** - WebSockets
- **PyJWT** - Autenticación JWT
- **Passlib/Bcrypt** - Encriptación

### Integraciones Externas
- **Google OAuth** - Login social
- **Mercado Pago** - Pagos y suscripciones
- **Resend** - Emails transaccionales
- **Google Maps/Places** - Geolocalización

---

## 📊 Modelo de Datos Principal

| Colección | Campos Principales |
|-----------|-------------------|
| **users** | user_id, email, name, role, picture, phone |
| **providers** | provider_id, user_id, business_name, address, lat/lng, services, rating |
| **pets** | pet_id, user_id, name, species, breed, size, age, sex, photo |
| **bookings** | booking_id, client_id, provider_id, service_type, dates, pets, status |
| **subscriptions** | subscription_id, user_id, plan_id, status, dates |
| **reviews** | review_id, provider_id, user_id, rating, comment, photos |
| **messages** | message_id, conversation_id, sender_id, message, timestamp |
| **notifications** | notification_id, user_id, type, message, read |

---

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Contraseñas encriptadas con Bcrypt
- Validación de suscripción para acceso a datos sensibles
- Protección de rutas por rol
- CORS configurado
- Sanitización de inputs

---

## 📱 Características UX/UI

- Diseño responsive (móvil/tablet/desktop)
- Modo claro con colores corporativos (rojo U-CAN)
- Notificaciones toast en tiempo real
- Carga progresiva con spinners
- Formularios con validación visual
- Navegación intuitiva

---

## 📈 Métricas Disponibles (Admin)

- Nuevos usuarios por período
- Suscripciones activas
- Cuidadores pendientes de aprobación
- Reservas por estado
- Gráficos de tendencias

---

*Documento generado: Febrero 2025*
*Versión: 1.0*
