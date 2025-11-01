# 🚀 Guide de Déploiement ReExpressTrack sur VPS

Ce guide vous accompagne pas à pas pour déployer ReExpressTrack sur un VPS de production.

## 📋 Table des Matières

1. [Pré-requis](#pré-requis)
2. [Checklist Avant Déploiement](#checklist-avant-déploiement)
3. [Configuration du VPS](#configuration-du-vps)
4. [Installation des Services](#installation-des-services)
5. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
6. [Déploiement Backend](#déploiement-backend)
7. [Déploiement Frontend](#déploiement-frontend)
8. [Configuration Nginx](#configuration-nginx)
9. [SSL/HTTPS](#sslhttps)
10. [Monitoring et Logs](#monitoring-et-logs)
11. [Sécurité](#sécurité)
12. [Maintenance](#maintenance)

---

## 📌 Pré-requis

### VPS Recommandé

- **CPU** : 2 vCPUs minimum (4 vCPUs recommandé)
- **RAM** : 4 GB minimum (8 GB recommandé)
- **Stockage** : 50 GB SSD minimum (100 GB recommandé)
- **OS** : Ubuntu 22.04 LTS ou 24.04 LTS
- **Bande passante** : Illimitée

### Fournisseurs Recommandés

- **OVH** : VPS Value (à partir de 7€/mois)
- **Hetzner** : CX21 (à partir de 5€/mois)
- **DigitalOcean** : Droplet 4GB (à partir de 24$/mois)
- **Scaleway** : DEV1-M (à partir de 7€/mois)

### Domaine

- Un nom de domaine (ex: `reexpresstrack.com`)
- Accès aux DNS du domaine

---

## ✅ Checklist Avant Déploiement

### 1. Code et Configuration

- [ ] Tout le code est commité et poussé sur GitHub
- [ ] Les tests passent localement
- [ ] Le build du frontend fonctionne (`npm run build`)
- [ ] Les migrations de base de données sont prêtes
- [ ] Les variables d'environnement sont documentées

### 2. Services Externes

- [ ] Compte Resend créé avec clé API
- [ ] Compte Stripe configuré (clés production)
- [ ] Compte 17Track avec clé API
- [ ] Domaine acheté et accès DNS disponible

### 3. Sécurité

- [ ] Secrets JWT générés (production)
- [ ] Secrets Stripe webhook générés
- [ ] Clés API sécurisées
- [ ] Stratégie de backup définie

### 4. Documentation

- [ ] README à jour
- [ ] Variables d'environnement documentées
- [ ] Guide de déploiement lu (ce document)

---

## 🖥️ Configuration du VPS

### Étape 1 : Connexion Initiale

```bash
# Se connecter au VPS
ssh root@VOTRE_IP_VPS

# Mettre à jour le système
apt update && apt upgrade -y
```

### Étape 2 : Créer un Utilisateur Non-Root

```bash
# Créer l'utilisateur
adduser reexpress
usermod -aG sudo reexpress

# Configurer SSH pour le nouvel utilisateur
mkdir -p /home/reexpress/.ssh
cp /root/.ssh/authorized_keys /home/reexpress/.ssh/
chown -R reexpress:reexpress /home/reexpress/.ssh
chmod 700 /home/reexpress/.ssh
chmod 600 /home/reexpress/.ssh/authorized_keys

# Se connecter avec le nouvel utilisateur
exit
ssh reexpress@VOTRE_IP_VPS
```

### Étape 3 : Configuration du Firewall

```bash
# Installer et configurer UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### Étape 4 : Installer les Dépendances de Base

```bash
# Installer les paquets essentiels
sudo apt install -y curl wget git build-essential software-properties-common

# Installer Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

## 🛠️ Installation des Services

### PostgreSQL 15

```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données et l'utilisateur
sudo -u postgres psql << EOF
CREATE DATABASE reexpresstrack;
CREATE USER reexpress WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
ALTER DATABASE reexpresstrack OWNER TO reexpress;
GRANT ALL PRIVILEGES ON DATABASE reexpresstrack TO reexpress;
\q
EOF

# Tester la connexion
psql -h localhost -U reexpress -d reexpresstrack -W
# Entrez le mot de passe
# Tapez \q pour quitter
```

### Redis

```bash
# Installer Redis
sudo apt install -y redis-server

# Configurer Redis
sudo nano /etc/redis/redis.conf
# Chercher et modifier :
# supervised systemd
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Redémarrer Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Tester Redis
redis-cli ping
# Doit répondre: PONG
```

### MinIO (Stockage S3)

```bash
# Télécharger MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Créer les répertoires
sudo mkdir -p /mnt/data/minio
sudo chown reexpress:reexpress /mnt/data/minio

# Créer le service systemd
sudo nano /etc/systemd/system/minio.service
```

Contenu de `minio.service` :

```ini
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
User=reexpress
Group=reexpress
Type=notify

WorkingDirectory=/home/reexpress

Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=CHANGEZ_MOI_MOT_DE_PASSE_SECURISE"
Environment="MINIO_VOLUMES=/mnt/data/minio"

ExecStart=/usr/local/bin/minio server /mnt/data/minio --console-address :9001

Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

```bash
# Démarrer MinIO
sudo systemctl daemon-reload
sudo systemctl start minio
sudo systemctl enable minio

# Vérifier le statut
sudo systemctl status minio
```

### Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### PM2 (Process Manager)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

---

## 🗄️ Configuration de la Base de Données

### Étape 1 : Cloner le Projet

```bash
# Se placer dans le répertoire home
cd ~

# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/ReexprssTrack.git
cd ReexprssTrack
```

### Étape 2 : Configurer les Variables d'Environnement

```bash
cd backend
cp .env.example .env
nano .env
```

Configurer le fichier `.env` pour la production :

```bash
# ===========================================
# ENVIRONMENT
# ===========================================
NODE_ENV=production

# ===========================================
# SERVER
# ===========================================
HOST=0.0.0.0
PORT=3000

# ===========================================
# DATABASE (Production)
# ===========================================
DATABASE_URL="postgresql://reexpress:VOTRE_MOT_DE_PASSE@localhost:5432/reexpresstrack?schema=public"

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===========================================
# JWT (IMPORTANT: Générer de nouveaux secrets !)
# ===========================================
# Générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=GENERER_UN_NOUVEAU_SECRET_PRODUCTION
JWT_REFRESH_SECRET=GENERER_UN_NOUVEAU_SECRET_PRODUCTION

# ===========================================
# CORS
# ===========================================
CORS_ORIGIN=https://reexpresstrack.com,https://www.reexpresstrack.com

# ===========================================
# STRIPE (Production Keys)
# ===========================================
STRIPE_SECRET_KEY=sk_live_votre_cle_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique

# ===========================================
# MINIO
# ===========================================
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=VOTRE_MOT_DE_PASSE_MINIO
MINIO_BUCKET=reexpresstrack
MINIO_USE_SSL=false

# ===========================================
# EMAIL (Resend - Production)
# ===========================================
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@reexpresstrack.com
EMAIL_FROM_NAME=ReExpressTrack
RESEND_API_KEY=re_votre_cle_production

# ===========================================
# 17TRACK API
# ===========================================
TRACK17_API_KEY=votre_cle_17track

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info

# ===========================================
# FRONTEND URL
# ===========================================
FRONTEND_URL=https://reexpresstrack.com
```

### Étape 3 : Générer les Secrets JWT

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer JWT_REFRESH_SECRET (différent du premier !)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier ces valeurs dans .env
```

### Étape 4 : Installer les Dépendances et Migrer

```bash
# Installer les dépendances backend
cd ~/ReexprssTrack/backend
npm install --production

# Générer Prisma Client
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# (Optionnel) Seed initial data
npx prisma db seed
```

---

## 🔧 Déploiement Backend

### Étape 1 : Build (si nécessaire)

```bash
cd ~/ReexprssTrack/backend

# Si vous utilisez TypeScript compilé
npm run build
```

### Étape 2 : Configuration PM2

Créer le fichier `ecosystem.config.js` :

```bash
nano ecosystem.config.js
```

Contenu :

```javascript
module.exports = {
  apps: [{
    name: 'reexpresstrack-api',
    script: 'src/server.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Étape 3 : Démarrer avec PM2

```bash
# Créer le répertoire de logs
mkdir -p logs

# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs reexpresstrack-api

# Configurer PM2 pour redémarrer au boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u reexpress --hp /home/reexpress
```

---

## 🎨 Déploiement Frontend

### Étape 1 : Configuration des Variables d'Environnement

```bash
cd ~/ReexprssTrack/frontend
nano .env.production
```

Contenu :

```bash
VITE_API_URL=https://api.reexpresstrack.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique
```

### Étape 2 : Build du Frontend

```bash
# Installer les dépendances
npm install

# Build pour production
npm run build

# Le build sera dans le dossier dist/
```

### Étape 3 : Déplacer les Fichiers Build

```bash
# Créer le répertoire web
sudo mkdir -p /var/www/reexpresstrack
sudo chown -R reexpress:reexpress /var/www/reexpresstrack

# Copier le build
cp -r dist/* /var/www/reexpresstrack/
```

---

## 🌐 Configuration Nginx

### Étape 1 : Configuration pour l'API

```bash
sudo nano /etc/nginx/sites-available/reexpresstrack-api
```

Contenu :

```nginx
server {
    listen 80;
    server_name api.reexpresstrack.com;

    # Logs
    access_log /var/log/nginx/reexpresstrack-api-access.log;
    error_log /var/log/nginx/reexpresstrack-api-error.log;

    # Proxy vers le backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Limite de taille pour uploads
    client_max_body_size 50M;
}
```

### Étape 2 : Configuration pour le Frontend

```bash
sudo nano /etc/nginx/sites-available/reexpresstrack-frontend
```

Contenu :

```nginx
server {
    listen 80;
    server_name reexpresstrack.com www.reexpresstrack.com;

    root /var/www/reexpresstrack;
    index index.html;

    # Logs
    access_log /var/log/nginx/reexpresstrack-access.log;
    error_log /var/log/nginx/reexpresstrack-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache des assets statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA - toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sécurité headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### Étape 3 : Activer les Sites

```bash
# Créer les symlinks
sudo ln -s /etc/nginx/sites-available/reexpresstrack-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/reexpresstrack-frontend /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS avec Certbot

### Étape 1 : Configurer les DNS

Avant d'installer SSL, configurer les DNS :

```
Type    Nom                      Valeur
A       reexpresstrack.com       VOTRE_IP_VPS
A       www.reexpresstrack.com   VOTRE_IP_VPS
A       api.reexpresstrack.com   VOTRE_IP_VPS
```

**Attendre 10-30 minutes pour la propagation DNS**

### Étape 2 : Installer Certbot

```bash
# Installer Certbot et le plugin Nginx
sudo apt install -y certbot python3-certbot-nginx

# Obtenir les certificats SSL
sudo certbot --nginx -d reexpresstrack.com -d www.reexpresstrack.com
sudo certbot --nginx -d api.reexpresstrack.com

# Suivre les instructions
# Choisir : Redirect (option 2) pour forcer HTTPS
```

### Étape 3 : Renouvellement Automatique

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Certbot configure automatiquement le renouvellement
# Vérifier le timer
sudo systemctl status certbot.timer
```

---

## 📊 Monitoring et Logs

### PM2 Monitoring

```bash
# Voir les logs en temps réel
pm2 logs

# Logs d'une app spécifique
pm2 logs reexpresstrack-api

# Monitoring en temps réel
pm2 monit

# Statistiques
pm2 status
```

### Logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/reexpresstrack-access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/reexpresstrack-error.log
```

### Logs PostgreSQL

```bash
# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Installer PM2 Log Rotate

```bash
pm2 install pm2-logrotate

# Configurer (optionnel)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔐 Sécurité

### 1. Fail2Ban (Protection contre bruteforce)

```bash
# Installer Fail2Ban
sudo apt install -y fail2ban

# Copier la config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Activer pour SSH et Nginx
sudo nano /etc/fail2ban/jail.local
```

Ajouter :

```ini
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
```

```bash
# Démarrer Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Vérifier le statut
sudo fail2ban-client status
```

### 2. Désactiver le Login Root SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Modifier :

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
# Redémarrer SSH
sudo systemctl restart sshd
```

### 3. Automatic Security Updates

```bash
# Installer unattended-upgrades
sudo apt install -y unattended-upgrades

# Configurer
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 💾 Stratégie de Backup

### 1. Backup PostgreSQL

Créer un script de backup :

```bash
nano ~/backup-db.sh
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR="/home/reexpress/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/reexpresstrack_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

# Backup
pg_dump -h localhost -U reexpress reexpresstrack | gzip > $BACKUP_FILE

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup créé: $BACKUP_FILE"
```

```bash
chmod +x ~/backup-db.sh

# Tester
./backup-db.sh

# Ajouter au crontab (tous les jours à 2h du matin)
crontab -e
# Ajouter:
0 2 * * * /home/reexpress/backup-db.sh >> /home/reexpress/backups/backup.log 2>&1
```

### 2. Backup MinIO

```bash
# Script de backup MinIO
nano ~/backup-minio.sh
```

Contenu :

```bash
#!/bin/bash
BACKUP_DIR="/home/reexpress/backups/minio"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

# Backup
tar -czf "$BACKUP_DIR/minio_$TIMESTAMP.tar.gz" /mnt/data/minio

# Garder 7 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup MinIO créé"
```

### 3. Backup Automatique vers Stockage Externe

Considérer :
- **Rsync** vers un autre serveur
- **AWS S3** ou **Backblaze B2** pour stockage cloud
- **OVH Object Storage** pour stockage S3-compatible

---

## 🧪 Tests Post-Déploiement

### 1. Tester l'API

```bash
# Health check
curl https://api.reexpresstrack.com/health

# Tester une route
curl https://api.reexpresstrack.com/api/auth/me
```

### 2. Tester le Frontend

Ouvrir dans le navigateur :
- https://reexpresstrack.com
- Tester l'inscription
- Tester la connexion
- Vérifier les emails (Resend dashboard)

### 3. Tester les Fonctionnalités

- [ ] Inscription utilisateur
- [ ] Vérification email
- [ ] Login/Logout
- [ ] Création de colis
- [ ] Upload de photos
- [ ] Création de devis
- [ ] Paiement Stripe (mode test puis production)
- [ ] Notifications email

---

## 🔄 Mise à Jour de l'Application

### Backend

```bash
cd ~/ReexprssTrack/backend

# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install --production

# Exécuter les migrations
npx prisma migrate deploy

# Régénérer Prisma client
npx prisma generate

# Redémarrer avec PM2
pm2 restart reexpresstrack-api

# Vérifier les logs
pm2 logs reexpresstrack-api
```

### Frontend

```bash
cd ~/ReexprssTrack/frontend

# Pull
git pull origin main

# Installer les dépendances
npm install

# Build
npm run build

# Copier
sudo rm -rf /var/www/reexpresstrack/*
sudo cp -r dist/* /var/www/reexpresstrack/
```

---

## 📈 Optimisations de Performance

### 1. Activer HTTP/2 dans Nginx

Dans les fichiers de config Nginx, après l'installation SSL :

```nginx
listen 443 ssl http2;
```

### 2. Configurer le Cache Redis

Le cache Redis est déjà configuré dans l'application. Vérifier qu'il est bien utilisé.

### 3. Optimiser PostgreSQL

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Ajuster selon la RAM (pour 4GB) :

```ini
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB
max_connections = 100
```

Redémarrer PostgreSQL :

```bash
sudo systemctl restart postgresql
```

---

## 🆘 Dépannage

### L'API ne répond pas

```bash
# Vérifier PM2
pm2 status
pm2 logs reexpresstrack-api

# Vérifier le port 3000
sudo netstat -tulpn | grep 3000

# Tester localement
curl http://localhost:3000/health
```

### Problème de Base de Données

```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Tester la connexion
psql -h localhost -U reexpress -d reexpresstrack -W
```

### Problème de SSL

```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew
```

### Logs utiles

```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# PM2
pm2 logs

# Système
sudo journalctl -xe
```

---

## 📞 Support et Ressources

- **Documentation Nginx** : https://nginx.org/en/docs/
- **PM2 Documentation** : https://pm2.keymetrics.io/docs/
- **Certbot** : https://certbot.eff.org/
- **PostgreSQL** : https://www.postgresql.org/docs/

---

## ✅ Checklist Finale

Après déploiement, vérifier :

- [ ] API accessible via https://api.reexpresstrack.com
- [ ] Frontend accessible via https://reexpresstrack.com
- [ ] SSL actif (cadenas vert)
- [ ] Inscription utilisateur fonctionne
- [ ] Emails envoyés (Resend dashboard)
- [ ] Paiement Stripe fonctionne
- [ ] PM2 configuré pour redémarrer au boot
- [ ] Backups automatiques configurés
- [ ] Logs accessibles et rotés
- [ ] Monitoring en place
- [ ] Fail2Ban actif
- [ ] Firewall configuré

---

🎉 **Félicitations !** Votre application ReExpressTrack est maintenant en production !
