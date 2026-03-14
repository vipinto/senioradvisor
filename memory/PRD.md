# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores en Chile. Transformada desde la app "U-CAN".

## Roles
- **Cliente/Familiar**: Buscar servicios, ver perfiles, dejar resenas
- **Proveedor (Residencia)**: Perfil con galeria, servicios, suscripcion Premium via MercadoPago
- **Admin**: Panel completo de administracion

## Categorias de Servicio
- Residencias | Cuidado a Domicilio | Salud Mental

## Estado Actual (Marzo 2026) - TODO FUNCIONAL

### Paginas Verificadas (100%)
- **Home**: Hero, categorias, residencias destacadas, blog, SeniorClub banner
- **Busqueda (/search)**: Mapa + lista, filtros por tipo de servicio, busqueda por comuna, imagenes gallery
- **Detalle Proveedor (/provider/:id)**: Nombre, galeria, rating, servicios, precios, contacto
- **Blog (/blog)**: 6 articulos con CRUD admin
- **SeniorClub (/seniorclub)**: Convenios (Help Rescate) con formulario de contacto
- **Auth**: Login/Register para 3 roles
- **Admin Panel (/admin)**: Stats, residencias, blog, leads, convenios, carga masiva
- **Provider Dashboard**: Stats, servicios, galeria, suscripcion

### Base de Datos
- 260 usuarios, 257 proveedores (10 seed + 246 importados CSV), 5 resenas, 6 articulos blog
- Carga masiva: 265 filas CSV procesadas en ~5 seg (batch insert optimizado)

### API Endpoints Clave
- Auth: POST /api/auth/login, /register, GET /api/auth/me
- Providers: GET /api/providers (filtros: service_type, comuna, skip, limit), GET /api/providers/:id
- Blog: GET/POST /api/blog/articles, PUT/DELETE /api/blog/articles/:id
- Partners: GET/POST /api/partners, POST /api/partners/leads
- Admin: GET /api/admin/stats, POST /api/admin/residencias/upload-excel, /create, /bulk-create

### Credenciales de Test
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Pendiente
- Google Maps: Muestra "Mapa no disponible" - usuario activara billing en Google Cloud
- Limpieza global terminologia antigua ("cuidador"/"mascota")
- Refactorizar AdminPanel.jsx en componentes mas pequenos

## Tech Stack
- Frontend: React, TailwindCSS, Shadcn UI, Google Maps API, lucide-react
- Backend: FastAPI, Pydantic, Motor (async MongoDB), pandas
- Database: MongoDB Atlas
- Auth: JWT + Google OAuth
- Payments: MercadoPago
- Font: Poppins | Colors: #00e7ff, #33404f
