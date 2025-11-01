# ⚡ Commandes Rapides de Déploiement

Guide de référence rapide pour déployer ReExpressTrack sur VPS Ubuntu.

---

## 🎯 Configuration Initiale VPS (1ère fois)

```bash
# 1. Connexion SSH
ssh root@VOTRE_IP_VPS

# 2. Mise à jour système
apt update && apt upgrade -y

# 3. Créer utilisateur
adduser reexpress
usermod -aG sudo reexpress

# 4. Configurer SSH pour nouvel utilisateur
mkdir -p /home/reexpress/.ssh
cp /root/.ssh/authorized_keys /home/reexpress/.ssh/
chown -R reexpress:reexpress /home/reexpress/.ssh
chmod 700 /home/reexpress/.ssh
chmod 600 /home/reexpress/.ssh/authorized_keys

# 5. Se connecter avec le nouvel utilisateur
exit
ssh reexpress@VOTRE_IP_VPS
```

---

## 🔥 Installation des Services

```bash
# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Paquets de base
sudo apt install -y curl wget git build-essential software-properties-common

# Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Redis
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# PM2
sudo npm install -g pm2

# Fail2Ban
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 🗄️ Configuration PostgreSQL

```bash
# Créer DB et utilisateur
sudo -u postgres psql << EOF
CREATE DATABASE reexpresstrack;
CREATE USER reexpress WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
ALTER DATABASE reexpresstrack OWNER TO reexpress;
GRANT ALL PRIVILEGES ON DATABASE reexpresstrack TO reexpress;
\q
EOF

# Tester la connexion
psql -h localhost -U reexpress -d reexpresstrack -W
# Entrer le mot de passe, puis \q pour quitter
```

---

## 📦 Déploiement Backend

```bash
# Cloner le projet
cd ~
git clone https://github.com/VOTRE_USERNAME/ReexprssTrack.git
cd ReexprssTrack/backend

# Configurer .env
cp .env.example .env
nano .env
# Configurer toutes les variables de production (voir PRE_DEPLOYMENT_CHECKLIST.md)

# Générer JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT_REFRESH_SECRET

# Installer dépendances
npm install --production

# Prisma
npx prisma generate
npx prisma migrate deploy

# Créer répertoire logs
mkdir -p logs

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Suivre les instructions affichées

# Vérifier
pm2 status
pm2 logs reexpresstrack-api
```

**Fichier `ecosystem.config.js`** :
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
    env: { NODE_ENV: 'production' },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## 🎨 Déploiement Frontend

```bash
cd ~/ReexprssTrack/frontend

# Configurer variables d'environnement
nano .env.production
# VITE_API_URL=https://api.reexpresstrack.com
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Installer et build
npm install
npm run build

# Créer répertoire web
sudo mkdir -p /var/www/reexpresstrack
sudo chown -R reexpress:reexpress /var/www/reexpresstrack

# Copier le build
cp -r dist/* /var/www/reexpresstrack/
```

---

## 🌐 Configuration Nginx

### API Backend

```bash
sudo nano /etc/nginx/sites-available/reexpresstrack-api
```

```nginx
server {
    listen 80;
    server_name api.reexpresstrack.com;

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
    }

    client_max_body_size 50M;
}
```

### Frontend

```bash
sudo nano /etc/nginx/sites-available/reexpresstrack-frontend
```

```nginx
server {
    listen 80;
    server_name reexpresstrack.com www.reexpresstrack.com;

    root /var/www/reexpresstrack;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Activer les sites

```bash
sudo ln -s /etc/nginx/sites-available/reexpresstrack-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/reexpresstrack-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Configuration SSL (Certbot)

```bash
# Installer SSL (après configuration DNS)
sudo certbot --nginx -d reexpresstrack.com -d www.reexpresstrack.com
sudo certbot --nginx -d api.reexpresstrack.com

# Choisir option 2 (Redirect) pour forcer HTTPS

# Test renouvellement auto
sudo certbot renew --dry-run
```

---

## 🔄 Mise à Jour Application

### Backend

```bash
cd ~/ReexprssTrack/backend
git pull origin main
npm install --production
npx prisma migrate deploy
npx prisma generate
pm2 restart reexpresstrack-api
pm2 logs reexpresstrack-api
```

### Frontend

```bash
cd ~/ReexprssTrack/frontend
git pull origin main
npm install
npm run build
sudo rm -rf /var/www/reexpresstrack/*
sudo cp -r dist/* /var/www/reexpresstrack/
```

---

## 💾 Backup PostgreSQL

**Créer script de backup** :

```bash
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/reexpress/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U reexpress reexpresstrack | gzip > "$BACKUP_DIR/reexpresstrack_$TIMESTAMP.sql.gz"

find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup créé: $BACKUP_DIR/reexpresstrack_$TIMESTAMP.sql.gz"
```

```bash
chmod +x ~/backup-db.sh
./backup-db.sh  # Tester

# Cron quotidien à 2h
crontab -e
# Ajouter:
0 2 * * * /home/reexpress/backup-db.sh >> /home/reexpress/backups/backup.log 2>&1
```

**Restaurer un backup** :

```bash
# Lister les backups
ls -lh ~/backups/postgres/

# Restaurer
gunzip < ~/backups/postgres/reexpresstrack_TIMESTAMP.sql.gz | psql -h localhost -U reexpress -d reexpresstrack
```

---

## 📊 Commandes Utiles

### PM2

```bash
pm2 status                    # Statut des apps
pm2 logs                      # Tous les logs
pm2 logs reexpresstrack-api   # Logs d'une app
pm2 monit                     # Monitoring temps réel
pm2 restart all               # Redémarrer tout
pm2 stop all                  # Arrêter tout
pm2 delete all                # Supprimer tout
pm2 save                      # Sauvegarder config
```

### Nginx

```bash
sudo nginx -t                 # Tester config
sudo systemctl reload nginx   # Recharger
sudo systemctl restart nginx  # Redémarrer
sudo systemctl status nginx   # Statut
sudo tail -f /var/log/nginx/error.log  # Logs erreur
```

### PostgreSQL

```bash
sudo systemctl status postgresql      # Statut
sudo systemctl restart postgresql     # Redémarrer
psql -h localhost -U reexpress -d reexpresstrack -W  # Connexion
sudo -u postgres psql                 # Connexion admin
```

### Redis

```bash
redis-cli ping                # Tester
redis-cli                     # CLI
sudo systemctl status redis   # Statut
```

### Firewall

```bash
sudo ufw status               # Statut
sudo ufw allow 8080/tcp       # Ouvrir port
sudo ufw delete allow 8080    # Fermer port
sudo ufw reload               # Recharger
```

### Fail2Ban

```bash
sudo fail2ban-client status           # Statut global
sudo fail2ban-client status sshd      # Statut SSH
sudo fail2ban-client unban IP_ADDRESS # Débanner une IP
```

### Système

```bash
df -h                         # Espace disque
free -h                       # RAM
top                           # Processus
htop                          # Processus (meilleur)
sudo journalctl -xe           # Logs système
```

---

## 🆘 Dépannage Rapide

### API ne répond pas

```bash
pm2 logs reexpresstrack-api
pm2 restart reexpresstrack-api
curl http://localhost:3000/health
sudo netstat -tulpn | grep 3000
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'API tourne
pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log
pm2 logs
```

### Base de données inaccessible

```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
psql -h localhost -U reexpress -d reexpresstrack -W
```

### SSL expire bientôt

```bash
sudo certbot certificates      # Voir dates expiration
sudo certbot renew            # Renouveler manuellement
```

### Manque d'espace disque

```bash
df -h                         # Vérifier l'espace
sudo du -sh /var/log/*        # Taille des logs
sudo journalctl --vacuum-time=3d  # Nettoyer logs système
pm2 flush                     # Nettoyer logs PM2
```

---

## 🔍 Monitoring

### Vérifier que tout fonctionne

```bash
# API
curl https://api.reexpresstrack.com/health

# Frontend
curl -I https://reexpresstrack.com

# PostgreSQL
psql -h localhost -U reexpress -d reexpresstrack -W -c "SELECT NOW();"

# Redis
redis-cli ping

# Services
sudo systemctl status nginx postgresql redis pm2-reexpress
```

---

## 📝 Notes Importantes

### Avant chaque déploiement

1. ✅ Tester localement
2. ✅ Commiter et pusher sur GitHub
3. ✅ Backup de la base de données
4. ✅ Vérifier l'espace disque
5. ✅ Informer l'équipe

### Après chaque déploiement

1. ✅ Vérifier les logs : `pm2 logs`
2. ✅ Tester l'API et le frontend
3. ✅ Vérifier que les emails fonctionnent
4. ✅ Vérifier les paiements Stripe

---

## 📞 Contacts Urgence

- **Support VPS** : [Lien fournisseur]
- **Resend Support** : https://resend.com/support
- **Stripe Support** : https://support.stripe.com/

---

🚀 **Guide complet** : Voir `DEPLOYMENT_GUIDE.md` pour plus de détails.
