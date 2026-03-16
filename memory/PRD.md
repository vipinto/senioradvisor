# SeniorAdvisor - PRD

## Descripción
Directorio de servicios para el cuidado de adultos mayores en Chile. Conecta familias con residencias, cuidado a domicilio y servicios de salud mental.

## Campos de Residencia
Nombre, Dirección, Región, Comuna, Sitio Web, Teléfono, Correo, Facebook, Instagram, PlaceID
Precio por 3 categorías (Residencias, Cuidado a Domicilio, Salud Mental) - si no se rellena, no aparece

## Gestión de Residencias (Admin + Provider)
- **Editar Perfil**: Todos los campos + 3 precios por categoría
- **Galería**: Subir/eliminar hasta 10 fotos
- **Servicios (Amenidades)**: Toggles activar/desactivar por categorías (Cuidado y Salud, Instalaciones, Habitaciones, Actividades)

## Registro Público de Residencias (Marzo 2026)
- Formulario público de 6 pasos en `/registrar-residencia`
- Paso 1: Datos de acceso (nombre residencia, email, contraseña)
- Paso 2: Contacto (teléfono, dirección, comuna, región, sitio web)
- Paso 3: Redes sociales (Facebook, Instagram)
- Paso 4: Servicios y precios (3 categorías)
- Paso 5: Amenidades
- Paso 6: Confirmación y envío
- Requiere aprobación de admin antes de aparecer en el directorio
- Backend: `POST /api/auth/register-provider` (sin autenticación)
- Página de éxito en `/registro-exitoso`

## Limpieza de Branding (Marzo 2026) - COMPLETADA
- Todas las referencias a U-CAN reemplazadas por SeniorAdvisor
- Terminología de mascotas (mascota, cuidador, paseo, daycare, perro) reemplazada por equivalentes de cuidado senior
- Páginas legales (FAQ, Términos, Privacidad, Seguridad) reescritas completamente
- Email templates actualizados
- Backend error messages actualizados

## Roles
- Cliente: Buscar, ver perfiles, reseñas
- Proveedor: Editar perfil, galería, servicios, suscripción Premium
- Admin: Panel completo, crear/editar residencias, gestionar galería y amenidades, aprobar/rechazar registros

## Estado (Marzo 2026) - FUNCIONAL
- 265+ usuarios, 262+ residencias
- Home, Búsqueda, Perfil Proveedor, Blog, SeniorClub, Admin Panel, Provider Dashboard
- Registro público multi-paso para residencias con aprobación admin
- Branding limpio SeniorAdvisor en todo el sitio

## Credenciales
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps: Usuario activará billing
- Paginación en resultados de búsqueda
- Autocompletado de comuna/región en búsqueda

## Arquitectura
```
/app
├── backend/
│   ├── routes/ (auth_routes.py, provider_routes.py, admin_routes.py, blog_routes.py, partner_routes.py, etc.)
│   ├── auth.py, database.py, models.py, server.py, email_service.py
│   └── uploads/ (gallery/, profile/, personal/)
├── frontend/
│   ├── src/
│   │   ├── pages/ (RegisterProvider.jsx, RegistroExitoso.jsx, AdminPanel.jsx, ProviderDashboard.jsx, SearchSimple.jsx, FAQ.jsx, Terms.jsx, Privacy.jsx, Seguridad.jsx, etc.)
│   │   ├── components/ (Navbar, Footer, ProviderGallery, AmenitiesToggle, CookieConsent, etc.)
│   │   └── App.js
```
