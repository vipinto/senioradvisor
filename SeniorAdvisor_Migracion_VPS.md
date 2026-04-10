# Tutorial: Migrar SeniorAdvisor a VPS HostGator
## Guia Paso a Paso - De HostGator Shared + Render/MongoDB Atlas a VPS Propio

---

## Resumen de tu VPS
- **Plan**: VPS NVMe 12
- **Specs**: 4 vCPU, 12 GB RAM DDR5, 300 GB NVMe, 1 IP Dedicado
- **OS recomendado**: Ubuntu 22.04 LTS

---

## FASE 1: PREPARAR EL VPS

### Paso 1.1 - Acceder al VPS por SSH

Cuando HostGator active tu VPS, recibiras un email con:
- IP del servidor (ej: 185.xxx.xxx.xxx)
- Usuario: root
- Password temporal

Desde tu Mac, abre Terminal:

```bash
ssh root@TU_IP_DEL_VPS
```

Ingresa la password temporal. Luego cambiala:

```bash
passwd
```

### Paso 1.2 - Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### Paso 1.3 - Crear usuario de aplicacion (no usar root)

```bash
adduser senioradvisor
usermod -aG sudo senioradvisor
```

Te pedira crear una password. Guardala bien.

### Paso 1.4 - Configurar firewall basico

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

Confirma con `y`. Ahora reconectate con el nuevo usuario:

```bash
ssh senioradvisor@TU_IP_DEL_VPS
```

---

## FASE 2: INSTALAR SOFTWARE NECESARIO

### Paso 2.1 - Instalar Node.js 20 (para React)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verificar:
```bash
node -v    # Deberia mostrar v20.x.x
npm -v     # Deberia mostrar 10.x.x
```

Instalar Yarn:
```bash
sudo npm install -g yarn
```

### Paso 2.2 - Instalar Python 3.11+ (para FastAPI)

```bash
sudo apt install -y python3 python3-pip python3-venv
```

Verificar:
```bash
python3 --version   # Deberia mostrar 3.10+ o 3.11+
```

### Paso 2.3 - Instalar MongoDB 7.0

```bash
# Importar clave GPG
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Agregar repositorio
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar
sudo apt update
sudo apt install -y mongodb-org

# Iniciar y habilitar
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verificar:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Deberia responder: { ok: 1 }
```

### Paso 2.4 - Instalar Nginx (proxy reverso + servir frontend)

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### Paso 2.5 - Instalar Certbot (SSL gratis con Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Paso 2.6 - Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

---

## FASE 3: MIGRAR LA BASE DE DATOS MONGODB

### Paso 3.1 - Exportar datos desde MongoDB actual (Atlas/Render)

Desde tu computador local o desde el VPS, necesitas la URI de conexion actual.
Busca tu MONGO_URL actual (esta en tu archivo backend/.env de la app actual).

Se vera algo asi:
```
mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/senioradvisor
```

Exportar TODA la base de datos:

```bash
# Instalar herramientas de MongoDB en tu Mac primero (si no las tienes)
# brew install mongodb-database-tools

# Exportar (ejecutar desde tu computador)
mongodump --uri="TU_MONGO_URL_ACTUAL" --out=/tmp/senioradvisor_backup
```

Esto crea una carpeta con todos los datos.

### Paso 3.2 - Subir el backup al VPS

```bash
# Desde tu Mac
scp -r /tmp/senioradvisor_backup senioradvisor@TU_IP_DEL_VPS:/home/senioradvisor/
```

### Paso 3.3 - Importar datos en MongoDB del VPS

```bash
# En el VPS
mongorestore --db senioradvisor /home/senioradvisor/senioradvisor_backup/senioradvisor
```

Verificar:
```bash
mongosh
> use senioradvisor
> db.providers.countDocuments()
# Deberia mostrar el numero de residencias que tienes
> exit
```

### Paso 3.4 - Asegurar MongoDB (crear usuario)

```bash
mongosh
> use admin
> db.createUser({
    user: "senioradvisor_app",
    pwd: "TU_PASSWORD_SEGURA_AQUI",
    roles: [{ role: "readWrite", db: "senioradvisor" }]
  })
> exit
```

Habilitar autenticacion en MongoDB:

```bash
sudo nano /etc/mongod.conf
```

Buscar la seccion `#security:` y cambiarla a:

```yaml
security:
  authorization: enabled
```

Reiniciar MongoDB:
```bash
sudo systemctl restart mongod
```

Tu nueva MONGO_URL sera:
```
mongodb://senioradvisor_app:TU_PASSWORD_SEGURA_AQUI@localhost:27017/senioradvisor
```

---

## FASE 4: SUBIR EL CODIGO DE LA APLICACION

### Paso 4.1 - Opcion A: Desde GitHub (recomendado)

Si tu codigo esta en GitHub:

```bash
# En el VPS
cd /home/senioradvisor
git clone https://github.com/TU_USUARIO/senioradvisor.git app
cd app
```

### Paso 4.1 - Opcion B: Subir archivos directamente

Si no tienes GitHub, desde tu Mac:

```bash
# Comprimir el proyecto (sin node_modules)
cd /ruta/a/tu/proyecto
tar --exclude='node_modules' --exclude='.git' --exclude='__pycache__' -czf senioradvisor.tar.gz .

# Subir al VPS
scp senioradvisor.tar.gz senioradvisor@TU_IP_DEL_VPS:/home/senioradvisor/

# En el VPS, descomprimir
ssh senioradvisor@TU_IP_DEL_VPS
mkdir -p /home/senioradvisor/app
cd /home/senioradvisor/app
tar -xzf /home/senioradvisor/senioradvisor.tar.gz
```

### Paso 4.2 - Configurar variables de entorno del Backend

```bash
cd /home/senioradvisor/app/backend
nano .env
```

Contenido del .env:

```env
MONGO_URL=mongodb://senioradvisor_app:TU_PASSWORD_SEGURA_AQUI@localhost:27017/senioradvisor
DB_NAME=senioradvisor
JWT_SECRET=tu_jwt_secret_largo_y_seguro_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 4.3 - Configurar variables de entorno del Frontend

```bash
cd /home/senioradvisor/app/frontend
nano .env
```

Contenido:

```env
REACT_APP_BACKEND_URL=https://senioradvisor.cl
REACT_APP_GOOGLE_MAPS_KEY=tu_google_maps_key
```

---

## FASE 5: INSTALAR DEPENDENCIAS Y COMPILAR

### Paso 5.1 - Backend (FastAPI + Python)

```bash
cd /home/senioradvisor/app/backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Verificar que corre
uvicorn server:app --host 0.0.0.0 --port 8001
# Si ves "Application startup complete", esta OK
# Presiona Ctrl+C para parar
```

### Paso 5.2 - Frontend (React)

```bash
cd /home/senioradvisor/app/frontend

# Instalar dependencias
yarn install

# Compilar para produccion
yarn build
```

Esto crea la carpeta `build/` con los archivos estaticos.

---

## FASE 6: CONFIGURAR NGINX

### Paso 6.1 - Crear configuracion de Nginx

```bash
sudo nano /etc/nginx/sites-available/senioradvisor
```

Pegar este contenido:

```nginx
server {
    listen 80;
    server_name senioradvisor.cl www.senioradvisor.cl;

    # Frontend - archivos estaticos de React
    root /home/senioradvisor/app/frontend/build;
    index index.html;

    # Todas las rutas de API van al backend FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    # Archivos subidos / uploads
    location /uploads/ {
        alias /home/senioradvisor/app/backend/uploads/;
    }

    # React Router - todas las demas rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para archivos estaticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Paso 6.2 - Activar el sitio

```bash
# Crear enlace simbolico
sudo ln -s /etc/nginx/sites-available/senioradvisor /etc/nginx/sites-enabled/

# Eliminar sitio default
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuracion
sudo nginx -t

# Si dice "syntax is ok", reiniciar
sudo systemctl restart nginx
```

---

## FASE 7: CONFIGURAR SSL (HTTPS)

### Paso 7.1 - Apuntar dominio al VPS

Antes de este paso, ve al panel de tu dominio (donde compraste senioradvisor.cl)
y cambia los DNS:

- **Registro A**: `senioradvisor.cl` -> TU_IP_DEL_VPS
- **Registro A**: `www.senioradvisor.cl` -> TU_IP_DEL_VPS

Espera 5-30 minutos para que propaguen.

### Paso 7.2 - Generar certificado SSL

```bash
sudo certbot --nginx -d senioradvisor.cl -d www.senioradvisor.cl
```

Te pedira:
1. Tu email (para notificaciones de renovacion)
2. Aceptar terminos (Y)
3. Compartir email con EFF (opcional, N)

Certbot modificara automaticamente tu config de Nginx para usar HTTPS.

### Paso 7.3 - Verificar renovacion automatica

```bash
sudo certbot renew --dry-run
```

Si dice "Congratulations", la renovacion automatica funciona.

---

## FASE 8: EJECUTAR LA APP CON PM2

### Paso 8.1 - Crear script de inicio para el backend

```bash
cd /home/senioradvisor/app
nano ecosystem.config.js
```

Contenido:

```javascript
module.exports = {
  apps: [
    {
      name: 'senioradvisor-backend',
      cwd: '/home/senioradvisor/app/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001 --workers 3',
      env: {
        NODE_ENV: 'production'
      },
      max_restarts: 10,
      restart_delay: 5000,
    }
  ]
};
```

### Paso 8.2 - Iniciar con PM2

```bash
cd /home/senioradvisor/app
pm2 start ecosystem.config.js

# Verificar que esta corriendo
pm2 status
pm2 logs senioradvisor-backend
```

### Paso 8.3 - Configurar PM2 para que inicie al reiniciar el VPS

```bash
pm2 startup
# Copia y ejecuta el comando que te muestra

pm2 save
```

---

## FASE 9: VERIFICACION FINAL

### Paso 9.1 - Checklist de verificacion

Ejecutar estos comandos en el VPS:

```bash
# 1. MongoDB esta corriendo?
sudo systemctl status mongod
# Debe decir "active (running)"

# 2. Backend esta corriendo?
pm2 status
# Debe mostrar "senioradvisor-backend" con status "online"

# 3. Nginx esta corriendo?
sudo systemctl status nginx
# Debe decir "active (running)"

# 4. Probar API directamente
curl http://localhost:8001/api/providers?limit=1
# Debe retornar JSON con datos

# 5. Probar desde fuera (en tu Mac)
curl https://senioradvisor.cl/api/providers?limit=1
# Debe retornar los mismos datos
```

### Paso 9.2 - Probar en el navegador

1. Abre https://senioradvisor.cl
2. Verifica que carga la pagina principal
3. Prueba buscar residencias
4. Prueba iniciar sesion como admin
5. Verifica que las imagenes cargan

---

## FASE 10: MANTENIMIENTO

### Actualizar el codigo (cuando hagas cambios)

```bash
# En el VPS
cd /home/senioradvisor/app

# Si usas GitHub:
git pull origin main

# Recompilar frontend (si hay cambios)
cd frontend
yarn install
yarn build

# Reiniciar backend (si hay cambios)
cd ..
pm2 restart senioradvisor-backend
```

### Hacer backup de MongoDB periodicamente

Crear script de backup automatico:

```bash
nano /home/senioradvisor/backup.sh
```

Contenido:
```bash
#!/bin/bash
FECHA=$(date +%Y%m%d_%H%M)
mongodump --uri="mongodb://senioradvisor_app:TU_PASSWORD@localhost:27017/senioradvisor" \
  --out=/home/senioradvisor/backups/$FECHA
# Borrar backups de mas de 30 dias
find /home/senioradvisor/backups -mtime +30 -exec rm -rf {} +
```

Hacerlo ejecutable y programar (todos los dias a las 3 AM):
```bash
chmod +x /home/senioradvisor/backup.sh
mkdir -p /home/senioradvisor/backups
crontab -e
# Agregar esta linea:
0 3 * * * /home/senioradvisor/backup.sh
```

### Ver logs del backend

```bash
pm2 logs senioradvisor-backend
pm2 logs senioradvisor-backend --lines 100
```

### Ver logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar servicios si hay problemas

```bash
sudo systemctl restart mongod
pm2 restart senioradvisor-backend
sudo systemctl restart nginx
```

---

## RESUMEN DE PUERTOS Y SERVICIOS

| Servicio | Puerto | Acceso |
|----------|--------|--------|
| Nginx (HTTP) | 80 | Publico (redirige a 443) |
| Nginx (HTTPS) | 443 | Publico |
| FastAPI Backend | 8001 | Solo interno (via Nginx) |
| MongoDB | 27017 | Solo interno (localhost) |

---

## RESUMEN DE ARCHIVOS IMPORTANTES

| Archivo | Ubicacion |
|---------|-----------|
| Codigo app | /home/senioradvisor/app/ |
| Frontend build | /home/senioradvisor/app/frontend/build/ |
| Backend .env | /home/senioradvisor/app/backend/.env |
| Frontend .env | /home/senioradvisor/app/frontend/.env |
| Nginx config | /etc/nginx/sites-available/senioradvisor |
| PM2 config | /home/senioradvisor/app/ecosystem.config.js |
| Backups MongoDB | /home/senioradvisor/backups/ |
| Logs Nginx | /var/log/nginx/ |

---

## TROUBLESHOOTING COMUN

**El sitio no carga:**
1. Verificar DNS: `nslookup senioradvisor.cl` (debe mostrar tu IP)
2. Verificar Nginx: `sudo nginx -t && sudo systemctl status nginx`
3. Verificar backend: `pm2 status`

**Error 502 Bad Gateway:**
- El backend no esta corriendo. Ejecutar: `pm2 restart senioradvisor-backend && pm2 logs`

**Error 504 Gateway Timeout:**
- El backend tarda mucho. Revisar logs: `pm2 logs senioradvisor-backend`

**MongoDB no conecta:**
- Verificar servicio: `sudo systemctl status mongod`
- Verificar credenciales en backend/.env
- Probar conexion: `mongosh "mongodb://senioradvisor_app:TU_PASSWORD@localhost:27017/senioradvisor"`

**SSL no funciona:**
- Verificar DNS estan apuntando al VPS
- Ejecutar: `sudo certbot --nginx -d senioradvisor.cl -d www.senioradvisor.cl`

---

Documento preparado para SeniorAdvisor.cl
VPS HostGator NVMe 12 (4 vCPU, 12 GB RAM, 300 GB NVMe)
