# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores. Transformada desde la app "U-CAN".

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Buscar servicios, ver perfiles, dejar resenas (SIN suscripcion)
- **Proveedor**: Ofrece residencias, cuidado a domicilio o salud mental. Suscripcion Premium via MercadoPago
- **Admin**: Panel de administracion completo

### Categorias
- Residencias | Cuidado a Domicilio | Salud Mental

### Planes de Suscripcion (Proveedores - MercadoPago Produccion)
- Mensual: $19.990 CLP | Trimestral: $49.990 CLP | Anual: $149.990 CLP

## Funcionalidades Implementadas

### Home
- Hero con buscador
- Nuestros Servicios (3 categorias)
- **SeniorClub** - Convenios con entidades externas (Help Rescate)
- Residencias Destacadas (10 premium con carrusel)
- Como usar SeniorAdvisor (3 pasos)
- Sobre Nosotros (con video YouTube)
- Actualidad Mayor (seccion blog)
- CTA para proveedores

### SeniorClub - Convenios
- Seccion en homepage con tarjetas de socios
- Pagina interna por convenio: /convenio/help-rescate
- Modal de contacto (Nombre, Correo, Telefono +56, Tipo de contacto)
- Backend almacena leads para seguimiento de comisiones
- Admin panel: Tab "Leads" con tabla de contactos

### Help Rescate (Primer convenio)
- Logo, descripcion, regiones disponibles
- Plan Hogar: Desde $8.336/mes (0.22 UF) - Mejoramiento del Hogar
- Plan Rescate Total: Desde $32.152/mes (0.81 UF) - Emergencias y traslados
- Servicios: Orientacion 24/7, Telemedicina, Medico domicilio, Rescate movil, etc.

### Perfil del Proveedor
- Hero: fondo #00e7ff, nombre en #33404f
- Rating, Galeria, Sobre mi, Servicios/amenidades
- Sidebar: Redes sociales, Precio, Contacto, Ubicacion

### Panel del Proveedor
- Suscripcion Premium (MercadoPago)
- Tab Servicios: toggles de amenidades + redes sociales
- Galeria, Reservas, Solicitudes

### Blog "Actualidad Mayor"
- Paginas publicas: /blog y /blog/:slug
- Admin CRUD completo desde panel de administracion
- 6 articulos seed

### Panel de Administracion (/admin)
- Dashboard con estadisticas
- Tabs: Pendientes, Residencias, Planes, Metricas, SOS, Blog, Leads, Convenios
- Blog CRUD, Gestion proveedores, Leads de convenios
- **Carga Masiva de Residencias**: Upload CSV/XLSX con mapeo automatico de columnas
  - Genera emails sinteticos para residencias sin correo
  - Genera contrasenas aleatorias
  - Batch insert optimizado (~5 seg para 265 filas)
  - Mapea: nombre, comuna, direccion, telefono, rating, imagenes, servicios, redes sociales, coordenadas
  - Resultados descargables como CSV

### Busqueda de Proveedores
- Filtros: comuna, tipo de servicio, rating
- Muestra 50 resultados por defecto (224+ aprobados en DB)
- Soporta servicios embebidos (CSV import) y coleccion separada (creacion manual)
- Ordenamiento: Destacados > Verificados > Por rating

## Key API Endpoints
- POST /api/auth/login, /register | GET /api/auth/me
- GET /api/providers | GET /api/providers/{id}
- PUT /api/providers/my-profile
- POST /api/reviews
- GET/POST /api/blog/articles | PUT/DELETE /api/blog/articles/{id}
- POST /api/partners/leads | GET /api/partners/leads
- GET /api/partners/leads/stats
- Admin: /api/admin/stats, /providers, /plans, /metrics
- **POST /api/admin/residencias/upload-excel** - Carga masiva CSV/XLSX
- POST /api/admin/residencias/create - Creacion individual
- POST /api/admin/residencias/bulk-create - Creacion masiva JSON

## Credenciales de Test
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Estado Actual (Marzo 2026)

### Completado
- Re-branding U-CAN -> SeniorAdvisor
- Categorias de servicios actualizadas
- Sistema de resenas 5 criterios
- MercadoPago produccion (3 planes)
- Amenidades + redes sociales en perfil y dashboard
- Residencias Destacadas (10 proveedores premium)
- Blog "Actualidad Mayor" con CRUD admin
- SeniorClub con convenio Help Rescate
- Sistema de leads para seguimiento de comisiones
- Seccion "Como usar SeniorAdvisor" (3 pasos)
- **Carga masiva de residencias desde CSV** (265 filas, 246 creadas, ~5 seg)
- **Busqueda relajada** para incluir proveedores importados

### Pendiente
- P1: Google Maps (desactivado, requiere config externa)
- P2: Limpieza global terminologia ("cuidador"/"mascota")
- P2: Refactorizacion archivos grandes (AdminPanel.jsx)
- P2: Paginacion/scroll infinito en pagina de busqueda (muestra 50 de 224+)

## Tech Stack
- Frontend: React, TailwindCSS, Shadcn UI, embla-carousel-react, lucide-react
- Backend: FastAPI, Pydantic, Motor (async MongoDB), pandas
- Database: MongoDB Atlas
- Auth: JWT + Google OAuth
- Payments: MercadoPago
- Font: Poppins | Colors: #00e7ff, #33404f
