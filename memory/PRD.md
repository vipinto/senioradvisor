# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores en Chile.

## Roles
- **Cliente/Familiar**: Buscar servicios, ver perfiles, dejar resenas
- **Proveedor (Residencia)**: Perfil editable, galeria, servicios, suscripcion Premium via MercadoPago
- **Admin**: Panel completo de administracion

## Campos de Residencia
Nombre, Direccion, Region, Comuna, Sitio Web, Telefono, Correo Electronico, Facebook, Instagram, Precio (desde CLP), PlaceID, Tipo de Servicio

## Estado Actual (Marzo 2026) - TODO FUNCIONAL

### Paginas Verificadas
- Home: Hero, categorias, residencias destacadas, blog, SeniorClub
- Busqueda (/search): Mapa + lista, filtros por tipo, busqueda por comuna
- Detalle Proveedor (/provider/:id): Galeria, rating, servicios, precios, contacto
- Blog (/blog): CRUD admin
- SeniorClub (/seniorclub): Convenios con formulario contacto
- Auth: Login/Register 3 roles
- Admin Panel (/admin): Stats, residencias (crear individual + carga masiva CSV), blog, leads, convenios
- Provider Dashboard (/provider/dashboard): Editar Perfil (todos los campos), servicios, galeria, suscripcion

### Base de Datos
- 260+ usuarios, 257+ proveedores (10 seed + 246 CSV), 5 resenas, 6 articulos blog

### API Endpoints
- Auth: POST /api/auth/login, /register, GET /api/auth/me
- Providers: GET /api/providers, GET /api/providers/:id, PUT /api/providers/my-profile
- Blog: CRUD /api/blog/articles
- Partners: GET/POST /api/partners, POST /api/partners/leads
- Admin: GET /api/admin/stats, POST /api/admin/residencias/create, /upload-excel

### Credenciales
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps: Usuario activara billing
- Limpieza terminologia antigua
- Refactorizar AdminPanel.jsx

## Tech Stack
React, TailwindCSS, Shadcn UI, FastAPI, MongoDB Atlas, JWT, Google OAuth, MercadoPago, pandas
