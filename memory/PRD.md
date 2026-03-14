# SeniorAdvisor - Directorio de Servicios para Adultos Mayores

## Problema Original
Plataforma web para encontrar residencias, cuidado a domicilio y servicios de salud mental para adultos mayores. Transformada desde la app "U-CAN".

## Modelo de Negocio

### Roles
- **Cliente/Familiar**: Buscar servicios, ver perfiles, dejar reseñas (SIN suscripcion)
- **Proveedor**: Ofrece residencias, cuidado a domicilio o salud mental. Suscripcion Premium via MercadoPago
- **Admin**: Panel de administracion completo

### Categorias
- Residencias | Cuidado a Domicilio | Salud Mental

### Planes de Suscripcion (Proveedores - MercadoPago Produccion)
- Mensual: $19.990 CLP | Trimestral: $49.990 CLP | Anual: $149.990 CLP

## Funcionalidades Implementadas

### Home
- Hero con buscador
- Banner de llamado a la accion
- Nuestros Servicios (3 categorias)
- Residencias Destacadas (premium + rating >= 4.0, carrusel)
- Sobre Nosotros (con video YouTube)
- Actualidad Mayor (seccion blog en homepage)
- CTA para proveedores

### Perfil del Proveedor
- Hero: fondo #00e7ff, nombre en #33404f, comuna bold
- Rating: estrellas amarillas
- Galeria de fotos
- Sobre mi: descripcion
- Servicios: amenidades en 4 categorias
- Mas Informacion
- Resenas: sistema 5 criterios
- Sidebar: Redes sociales, Precio, Contacto, Ubicacion, CTA

### Panel del Proveedor
- Suscripcion Premium (MercadoPago)
- Tab Servicios: toggles de amenidades + redes sociales
- Galeria, Reservas, Solicitudes

### Blog "Actualidad Mayor"
- Paginas publicas: /blog (listado) y /blog/:slug (articulo individual)
- Seccion en homepage con ultimos articulos
- Admin CRUD completo desde panel de administracion
- 6 articulos seed en base de datos

### Panel de Administracion (/admin)
- Dashboard con estadisticas (usuarios, proveedores, suscripciones)
- Tabs: Pendientes, Cuidadores, Planes, Metricas, SOS Veterinario, Blog
- Blog: Crear, Editar, Eliminar articulos con formulario modal
- Gestion de proveedores (aprobar/rechazar/verificar)
- Gestion de planes de suscripcion

### Sistema de Resenas
- 5 criterios: personal, instalaciones, visitas, comida, actividades
- Promedio automatico
- Requiere login para dejar resena

## Key API Endpoints
- POST /api/auth/login, /register | GET /api/auth/me
- GET /api/providers | GET /api/providers/{id}
- PUT /api/providers/my-profile
- POST /api/reviews
- GET /api/subscription/plans?role=provider
- POST /api/subscription/create-payment
- POST /api/webhooks/mercadopago
- GET /api/blog/articles | POST /api/blog/articles
- GET /api/blog/articles/{slug}
- PUT /api/blog/articles/{article_id} | DELETE /api/blog/articles/{article_id}
- GET /api/admin/stats, /providers/pending, /providers/all, /plans, /metrics

## Credenciales de Test
- Admin: admin@senioradvisor.cl / admin123
- Cliente: demo@senioradvisor.cl / demo123
- Proveedor: proveedor1@senioradvisor.cl / demo123

## Estado Actual (Marzo 2026)

### Completado
- Re-branding U-CAN -> SeniorAdvisor
- Categorias de servicios actualizadas
- Sistema de resenas 5 criterios
- Eliminacion paywall clientes
- MercadoPago produccion (3 planes)
- Amenidades con 4 categorias + toggles en dashboard
- Redes sociales en perfil + dashboard
- Residencias Destacadas en Home (premium + rating >= 4.0)
- Blog "Actualidad Mayor" con CRUD admin completo
- Panel de administracion funcional con gestion de blog

### Pendiente
- P1: Google Maps (desactivado, requiere config externa del usuario)
- P2: Limpieza global terminologia ("cuidador"/"mascota")
- P2: Optimizacion modelo de datos
- P2: Refactorizacion Home.jsx y ProviderProfile.jsx (archivos grandes)

## Dominio
- senioradvisor.cl

## Tech Stack
- Frontend: React, TailwindCSS, Shadcn UI, embla-carousel-react, lucide-react
- Backend: FastAPI, Pydantic, Motor (async MongoDB)
- Database: MongoDB Atlas
- Auth: JWT + Google OAuth
- Payments: MercadoPago
- Font: Poppins
- Colors: #00e7ff (accent), #33404f (dark text)
