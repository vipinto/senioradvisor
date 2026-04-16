# Tutorial: Migrar SeniorAdvisor a VPS SIN Downtime
## Guia Zero Downtime - Tu web actual sigue online hasta el cambio final

---

## CONCEPTO

La idea es simple:
1. Montas TODO en el VPS nuevo usando la IP directa (ej: http://185.xxx.xxx.xxx)
2. Pruebas que funcione perfecto accediendo por IP
3. Cuando confirmas que esta OK, solo cambias el DNS de senioradvisor.cl apuntando al nuevo VPS
4. Tu web actual (HostGator shared) sigue online durante todo el proceso
5. El cambio de DNS toma 5-30 minutos - downtime casi cero

---

## FASE 1: PREPARAR EL VPS (sin tocar nada de tu web actual)

### Paso 1.1 - Acceder al VPS

```bash
ssh root@TU_IP_DEL_VPS
```

### Paso 1.2 - Actualizar sistema y crear usuario

```bash
apt update && apt upgrade -y
adduser senioradvisor
usermod -aG sudo senioradvisor
```

### Paso 1.3 - Firewall

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

Reconectarse:
```bash
ssh senioradvisor@TU_IP_DEL_VPS
```

---

## FASE 2: INSTALAR SOFTWARE

### Paso 2.1 - Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```

### Paso 2.2 - Python

```bash
sudo apt install -y python3 python3-pip python3-venv
```

### Paso 2.3 - MongoDB 7.0

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Paso 2.4 - Nginx y Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable nginx
```

### Paso 2.5 - PM2

```bash
sudo npm install -g pm2
```

---

## FASE 3: MIGRAR BASE DE DATOS

### Paso 3.1 - Exportar desde MongoDB actual

Desde tu Mac:
```bash
mongodump --uri="TU_MONGO_URL_ACTUAL" --out=/tmp/senioradvisor_backup
```

### Paso 3.2 - Subir al VPS

```bash
scp -r /tmp/senioradvisor_backup senioradvisor@TU_IP_DEL_VPS:/home/senioradvisor/
```

### Paso 3.3 - Importar en el VPS

```bash
# En el VPS
mongorestore --db senioradvisor /home/senioradvisor/senioradvisor_backup/senioradvisor
```

### Paso 3.4 - Asegurar MongoDB

```bash
mongosh
> use admin
> db.createUser({
    user: "senioradvisor_app",
    pwd: "TU_PASSWORD_SEGURA",
    roles: [{ role: "readWrite", db: "senioradvisor" }]
  })
> exit
```

Editar config:
```bash
sudo nano /etc/mongod.conf
```

Cambiar:
```yaml
security:
  authorization: enabled
```

```bash
sudo systemctl restart mongod
```

---

## FASE 4: SUBIR CODIGO

### Paso 4.1 - Clonar o subir proyecto

```bash
cd /home/senioradvisor
git clone https://github.com/TU_USUARIO/senioradvisor.git app
```

O subir directamente:
```bash
# Desde Mac
tar --exclude='node_modules' --exclude='.git' --exclude='__pycache__' -czf senioradvisor.tar.gz .
scp senioradvisor.tar.gz senioradvisor@TU_IP_DEL_VPS:/home/senioradvisor/

# En VPS
mkdir -p /home/senioradvisor/app && cd /home/senioradvisor/app
tar -xzf /home/senioradvisor/senioradvisor.tar.gz
```

### Paso 4.2 - Configurar Backend .env

```bash
cd /home/senioradvisor/app/backend
nano .env
```

```env
MONGO_URL=mongodb://senioradvisor_app:TU_PASSWORD_SEGURA@localhost:27017/senioradvisor
DB_NAME=senioradvisor
JWT_SECRET=tu_jwt_secret
RESEND_API_KEY=tu_resend_key
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 4.3 - Configurar Frontend .env (TEMPORAL con IP)

IMPORTANTE: Usamos la IP del VPS temporalmente, NO el dominio.

```bash
cd /home/senioradvisor/app/frontend
nano .env
```

```env
REACT_APP_BACKEND_URL=http://TU_IP_DEL_VPS
REACT_APP_GOOGLE_MAPS_KEY=tu_google_maps_key
```

---

## FASE 5: INSTALAR DEPENDENCIAS Y COMPILAR

### Paso 5.1 - Backend

```bash
cd /home/senioradvisor/app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Paso 5.2 - Frontend (compilar con la IP temporal)

```bash
cd /home/senioradvisor/app/frontend
yarn install
yarn build
```

---

## FASE 6: CONFIGURAR NGINX (TEMPORAL con IP)

```bash
sudo nano /etc/nginx/sites-available/senioradvisor
```

Configuracion temporal (funciona por IP, sin SSL):

```nginx
server {
    listen 80;
    server_name TU_IP_DEL_VPS;

    root /home/senioradvisor/app/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    location /uploads/ {
        alias /home/senioradvisor/app/backend/uploads/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/senioradvisor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## FASE 7: INICIAR BACKEND CON PM2

```bash
cd /home/senioradvisor/app
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'senioradvisor-backend',
      cwd: '/home/senioradvisor/app/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001 --workers 3',
      max_restarts: 10,
      restart_delay: 5000,
    }
  ]
};
```

```bash
pm2 start ecosystem.config.js
pm2 status
```

---

## FASE 8: PROBAR TODO POR IP (tu web actual sigue intacta)

### Checklist de pruebas

Abre tu navegador y entra a: http://TU_IP_DEL_VPS

1. Carga la pagina principal? SI/NO
2. Funciona el buscador? SI/NO
3. Se ven las residencias destacadas? SI/NO
4. Funciona el login admin? SI/NO
5. Se ven las fotos/imagenes? SI/NO
6. Funciona el perfil de residencia? SI/NO
7. Funciona el podcast? SI/NO
8. Funciona el blog? SI/NO
9. Funciona SeniorClub? SI/NO
10. Funcionan los filtros de busqueda? SI/NO

### Probar API directamente

```bash
curl http://TU_IP_DEL_VPS/api/providers?limit=1
```

Si todo funciona, sigue al paso 9. Si algo falla, revisa logs:

```bash
pm2 logs senioradvisor-backend
sudo tail -f /var/log/nginx/error.log
```

---

## FASE 9: PREPARAR PARA EL CAMBIO (recompilar con dominio real)

Una vez que TODO funciona por IP, recompilamos con el dominio real.

### Paso 9.1 - Cambiar Frontend .env al dominio real

```bash
cd /home/senioradvisor/app/frontend
nano .env
```

Cambiar a:
```env
REACT_APP_BACKEND_URL=https://senioradvisor.cl
REACT_APP_GOOGLE_MAPS_KEY=tu_google_maps_key
```

### Paso 9.2 - Recompilar frontend

```bash
yarn build
```

### Paso 9.3 - Actualizar Nginx para el dominio

```bash
sudo nano /etc/nginx/sites-available/senioradvisor
```

Reemplazar TODO el contenido con:

```nginx
server {
    listen 80;
    server_name senioradvisor.cl www.senioradvisor.cl;

    root /home/senioradvisor/app/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    location /uploads/ {
        alias /home/senioradvisor/app/backend/uploads/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## FASE 10: EL CAMBIO - Apuntar DNS al VPS nuevo (downtime ~5 min)

### Paso 10.1 - Cambiar DNS

Ve al panel donde administras el dominio senioradvisor.cl y cambia:

- **Registro A**: `senioradvisor.cl` -> TU_IP_DEL_VPS
- **Registro A**: `www.senioradvisor.cl` -> TU_IP_DEL_VPS

IMPORTANTE: Baja el TTL a 300 (5 minutos) unas horas ANTES del cambio.
Esto hace que el cambio se propague mas rapido.

### Paso 10.2 - Esperar propagacion DNS

```bash
# Verificar desde el VPS
nslookup senioradvisor.cl
# Debe mostrar TU_IP_DEL_VPS
```

Normalmente toma 5-30 minutos. Durante este tiempo:
- Algunos usuarios veran el sitio viejo (HostGator)
- Otros veran el sitio nuevo (VPS)
- No hay pagina en blanco, siempre ven alguna version

### Paso 10.3 - Instalar SSL

Una vez que el DNS apunta al VPS:

```bash
sudo certbot --nginx -d senioradvisor.cl -d www.senioradvisor.cl
```

### Paso 10.4 - Verificar

```bash
curl https://senioradvisor.cl/api/providers?limit=1
```

Si devuelve datos, esta listo.

---

## FASE 11: SINCRONIZAR DATOS FINALES

Durante la migracion, pudieron entrar datos nuevos al MongoDB viejo.
Haz una ultima sincronizacion:

### Paso 11.1 - Exportar datos finales del MongoDB viejo

```bash
# Desde Mac
mongodump --uri="TU_MONGO_URL_ACTUAL" --out=/tmp/senioradvisor_final
```

### Paso 11.2 - Subir e importar en VPS

```bash
scp -r /tmp/senioradvisor_final senioradvisor@TU_IP_DEL_VPS:/home/senioradvisor/

# En VPS
mongorestore --db senioradvisor --drop /home/senioradvisor/senioradvisor_final/senioradvisor
```

El flag `--drop` reemplaza los datos existentes con los nuevos.

---

## FASE 12: LIMPIEZA POST-MIGRACION

### Paso 12.1 - Configurar PM2 auto-inicio

```bash
pm2 startup
# Ejecutar el comando que muestra
pm2 save
```

### Paso 12.2 - Configurar backups automaticos

```bash
mkdir -p /home/senioradvisor/backups
nano /home/senioradvisor/backup.sh
```

```bash
#!/bin/bash
FECHA=$(date +%Y%m%d_%H%M)
mongodump --uri="mongodb://senioradvisor_app:TU_PASSWORD@localhost:27017/senioradvisor" \
  --out=/home/senioradvisor/backups/$FECHA
find /home/senioradvisor/backups -mtime +30 -exec rm -rf {} +
```

```bash
chmod +x /home/senioradvisor/backup.sh
crontab -e
# Agregar:
0 3 * * * /home/senioradvisor/backup.sh
```

### Paso 12.3 - Verificar renovacion SSL

```bash
sudo certbot renew --dry-run
```

### Paso 12.4 - Apagar hosting viejo

Una vez confirmado que todo funciona en el VPS (esperar 24-48 horas),
puedes cancelar o desactivar el hosting compartido de HostGator.

---

## RESUMEN DEL PROCESO

```
TIMELINE:
=========

Dia 1-2: Fases 1-7 (Montar todo en VPS)
         Tu web actual: ONLINE (no se toca nada)
         VPS: Funcionando por IP

Dia 2-3: Fase 8 (Probar todo por IP)
         Tu web actual: ONLINE
         VPS: Listo y probado

Dia 3 (minuto clave): Fases 9-10 (Cambio DNS)
         Downtime real: 0-5 minutos
         DNS propaga: 5-30 minutos

Dia 3: Fase 11 (Sincronizar ultimos datos)
         Tu web: Ahora corre desde el VPS

Dia 4-5: Fase 12 (Limpieza)
         Apagar hosting viejo cuando confirmes todo OK
```

---

## CHECKLIST PRE-CAMBIO

Antes de hacer el cambio de DNS (Fase 10), confirma:

- [ ] VPS funciona por IP (http://TU_IP)
- [ ] Login admin funciona
- [ ] Residencias se ven con fotos
- [ ] Buscador funciona con filtros
- [ ] Podcast funciona
- [ ] Blog funciona
- [ ] SeniorClub funciona
- [ ] Formulario de contacto funciona
- [ ] Backend responde en /api/providers
- [ ] Frontend .env actualizado con dominio real
- [ ] Frontend recompilado con yarn build
- [ ] Nginx actualizado con server_name del dominio
- [ ] TTL del DNS bajado a 300

---

## TROUBLESHOOTING

**Pagina muestra version vieja despues del cambio DNS:**
- Normal, la cache DNS tarda. Espera 30 min o prueba desde otro dispositivo/red

**Error 502 despues del cambio:**
```bash
pm2 restart senioradvisor-backend
pm2 logs
```

**SSL no funciona:**
- Espera a que DNS propague completamente, luego:
```bash
sudo certbot --nginx -d senioradvisor.cl -d www.senioradvisor.cl
```

**Datos viejos en el sitio nuevo:**
- Ejecutar Fase 11 (sincronizacion final de MongoDB)

---

Documento preparado para SeniorAdvisor.cl
Migracion Zero Downtime a VPS HostGator NVMe 12
