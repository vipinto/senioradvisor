# SeniorAdvisor - PRD

## Descripción
Buscador de residencias para adultos mayores en Chile. Las familias buscan residencias viendo fotos, ratings, comentarios y contactándose directamente. El equipo sube la base de datos; las residencias pueden reclamar su ficha o registrarse públicamente. Los admins también agregan residencias.

## Modelo de Negocio
- SeniorAdvisor sube toda la base de datos de residencias
- Las residencias pueden contactar para hacerse cargo de su ficha
- También pueden registrarse públicamente (formulario 6 pasos, requiere aprobación admin)
- Una residencia puede agregar sucursales (hasta 5)
- El fuerte: ratings y comentarios de familias

## Roles
- Cliente: Buscar, ver perfiles, reseñas, calificar
- Proveedor: Editar perfil, galería, servicios, sucursales, suscripción Premium
- Admin: Panel completo, crear/editar residencias, aprobar registros, blog, convenios

## Funcionalidades Implementadas
- Búsqueda de residencias con filtros
- Perfil detallado con fotos, amenidades, precios por 3 categorías
- Sistema de reseñas y ratings (5 criterios)
- Registro público multi-paso (6 pasos) con aprobación admin
- Sucursales: cada residencia puede agregar hasta 5 ubicaciones adicionales
- Dashboard proveedor: perfil, galería, amenidades, servicios, sucursales, reservas
- Admin panel: gestión completa de residencias, usuarios, blog, convenios
- Carga masiva CSV optimizada (~5 seg)
- Blog "Actualidad Mayor"
- SeniorClub (convenios)

## Estado (Marzo 2026)
- 265+ usuarios, 262+ residencias
- Branding 100% SeniorAdvisor (sin referencias U-CAN)

## Credenciales
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps (bloqueado por billing del usuario)
- Paginación en resultados de búsqueda
- Autocompletado comuna/región en búsqueda
- Refactoring de componentes grandes (AdminDashboard, ProviderDashboard)

## Arquitectura
```
/app
├── backend/
│   ├── routes/ (auth_routes.py, provider_routes.py, admin_routes.py, blog_routes.py, partner_routes.py, etc.)
│   ├── auth.py, database.py, models.py, server.py, email_service.py
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── pages/ (RegisterProvider.jsx, RegistroExitoso.jsx, AdminPanel.jsx, ProviderDashboard.jsx, SearchSimple.jsx, FAQ.jsx, Terms.jsx, Privacy.jsx, Seguridad.jsx, etc.)
│   │   ├── components/
│   │   └── App.js
```

## Key API Endpoints
- POST /api/auth/register-provider - Registro público de residencia
- GET/POST/DELETE /api/providers/my-branches - CRUD sucursales
- GET /api/providers - Búsqueda pública
- PUT /api/my-profile - Actualizar perfil proveedor
- POST /api/providers/bulk-upload-excel - Carga masiva
