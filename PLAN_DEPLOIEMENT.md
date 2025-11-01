# 🚀 Plan de Déploiement ReExpressTrack sur VPS

## 📋 Vue d'ensemble

**Objectif:** Déployer une plateforme complète de réexpédition de colis sur VPS avec Docker

**Durée estimée:** 2-3 semaines (selon disponibilité)

**Approche:** Docker Compose pour simplicité et portabilité

---

## 🎯 Stratégie Recommandée: Docker sur VPS

### ✅ Pourquoi Docker?

1. **Isolation** - Chaque service dans son propre conteneur
2. **Portabilité** - Fonctionne partout (dev, staging, prod)
3. **Facilité** - docker-compose up et c'est parti
4. **Scalabilité** - Facile d'ajouter des services ou scaler
5. **Maintenance** - Mises à jour simplifiées
6. **Coût** - Optimisé pour petit VPS (15€/mois)

### 📊 Comparaison des Options

| Option | Coût/mois | Complexité | Scalabilité | Recommandé |
|--------|-----------|------------|-------------|------------|
| **Docker sur VPS** | 15€ | ⭐⭐ Moyenne | ⭐⭐⭐ Bonne | ✅ **OUI** |
| Kubernetes | 50€+ | ⭐⭐⭐⭐⭐ Très élevée | ⭐⭐⭐⭐⭐ Excellente | ❌ Overkill |
| Installation manuelle | 15€ | ⭐⭐⭐⭐ Élevée | ⭐ Faible | ❌ Trop complexe |
| PaaS (Heroku, etc.) | 50-200€ | ⭐ Facile | ⭐⭐⭐ Bonne | ❌ Trop cher |

---

## 📅 Plan en 3 Phases

### 🔨 PHASE 1: Finalisation du Code (Semaine 1-2)

#### A. Backend (Priorité 1)

**Modules à développer:**

1. **Module Packages** (Gestion des colis)
   - CRUD complet
   - Upload de photos (MinIO)
   - Calcul des frais de stockage
   - Suivi avec 17Track API
   - Estimé: 2-3 jours

2. **Module Quotes** (Devis)
   - Génération de devis multi-transporteurs
   - Comparaison de prix
   - Génération PDF
   - Validation et expiration
   - Estimé: 2 jours

3. **Module Payments** (Paiements Stripe)
   - Intégration Stripe
   - Webhooks
   - Gestion des remboursements
   - Historique
   - Estimé: 2 jours

4. **Module Admin** (Administration)
   - Dashboard admin
   - Gestion utilisateurs
   - Gestion colis
   - Statistiques
   - Estimé: 2-3 jours

5. **Tests & Validation**
   - Tests unitaires
   - Tests d'intégration
   - Estimé: 1-2 jours

**Total estimé Backend: 9-12 jours**

#### B. Frontend (Priorité 2)

**Pages à créer:**

1. **Authentification**
   - Login/Register
   - Mot de passe oublié
   - Vérification email
   - Estimé: 1 jour

2. **Dashboard Client**
   - Vue d'ensemble
   - Liste des colis
   - Détail d'un colis
   - Galerie photos
   - Demande de devis
   - Estimé: 3-4 jours

3. **Dashboard Admin**
   - Statistiques
   - Gestion colis
   - Gestion utilisateurs
   - Gestion paiements
   - Estimé: 3-4 jours

4. **Pages Publiques**
   - Landing page
   - Pricing
   - FAQ
   - Contact
   - Estimé: 1-2 jours

**Total estimé Frontend: 8-11 jours**

---

### 🧪 PHASE 2: Tests Locaux (Semaine 2-3)

#### Checklist de Tests

- [ ] **Backend API**
  - [ ] Tous les endpoints fonctionnent
  - [ ] Authentification JWT fonctionne
  - [ ] Upload de fichiers (MinIO)
  - [ ] Intégration Stripe (mode test)
  - [ ] Emails envoyés (MailHog en dev)

- [ ] **Frontend**
  - [ ] Toutes les pages accessibles
  - [ ] Formulaires validés
  - [ ] Intégration API complète
  - [ ] Responsive (mobile/tablet/desktop)
  - [ ] Mode sombre/clair

- [ ] **Infrastructure Docker**
  - [ ] Tous les services démarrent
  - [ ] Base de données persistante
  - [ ] Cache Redis fonctionne
  - [ ] MinIO stocke les fichiers
  - [ ] Nginx route correctement

- [ ] **Performance**
  - [ ] Temps de réponse < 200ms
  - [ ] Cache activé
  - [ ] Images optimisées

**Durée estimée: 2-3 jours**

---

### 🚀 PHASE 3: Déploiement VPS (Semaine 3)

#### Étape 1: Choix et Configuration du VPS

**Recommandations VPS:**

| Fournisseur | Config | Prix/mois | Recommandé |
|-------------|--------|-----------|------------|
| **Hetzner** | CX21 (2 vCPU, 4GB RAM, 40GB) | ~5€ | ⭐⭐⭐ Excellent |
| **OVH** | VPS Starter (2 vCPU, 4GB RAM) | ~6€ | ⭐⭐⭐ Très bon |
| **DigitalOcean** | Basic (2 vCPU, 4GB RAM) | 24$ (~22€) | ⭐⭐ Bon mais cher |
| **Contabo** | VPS S (4 vCPU, 8GB RAM) | ~6€ | ⭐⭐⭐ Excellent rapport |

**Mon conseil: Hetzner CX21 ou Contabo VPS S**

**Configuration initiale:**

```bash
# 1. Se connecter au VPS
ssh root@votre-ip

# 2. Mise à jour système
apt update && apt upgrade -y

# 3. Installer Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# 4. Installer Docker Compose
apt install docker-compose -y

# 5. Configurer le firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable

# 6. Installer utilitaires
apt install -y git htop nano curl wget
```

**Durée: 30 minutes**

---

#### Étape 2: Déploiement de l'Application

**Script de déploiement automatique:**

```bash
#!/bin/bash
# deploy.sh - Script de déploiement automatique

set -e

echo "🚀 Déploiement ReExpressTrack..."

# 1. Cloner le projet
cd /opt
git clone https://github.com/Hicham60290/ReexprssTrack.git
cd ReexprssTrack

# 2. Créer le fichier .env
cp backend/.env.example backend/.env

echo "⚠️  IMPORTANT: Éditer backend/.env avec vos vraies valeurs!"
echo "Appuyez sur Entrée quand c'est fait..."
read

# 3. Générer des secrets sécurisés
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Les injecter dans .env
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" backend/.env
sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" backend/.env

# 4. Démarrer les services
docker-compose up -d

# 5. Attendre que la DB soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# 6. Initialiser la base de données
docker-compose exec -T backend npx prisma migrate deploy
docker-compose exec -T backend npx prisma generate

echo "✅ Déploiement terminé!"
echo "🌐 Accédez à votre application:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Backend API: http://$(curl -s ifconfig.me):3000"
echo "   Adminer: http://$(curl -s ifconfig.me):8080"
```

**Durée: 15 minutes**

---

#### Étape 3: Configuration SSL/HTTPS (Certbot)

**Domaine requis:** Vous devez avoir un nom de domaine pointant vers votre VPS

```bash
# 1. Installer Certbot
apt install -y certbot python3-certbot-nginx

# 2. Obtenir un certificat SSL
certbot --nginx -d votredomaine.com -d www.votredomaine.com

# 3. Renouvellement automatique (déjà configuré par Certbot)
# Vérifier: certbot renew --dry-run
```

**Durée: 10 minutes**

---

#### Étape 4: Configuration Nginx Production

**Fichier nginx/nginx.conf (production):**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:5173;
    }

    # Redirection HTTP → HTTPS
    server {
        listen 80;
        server_name votredomaine.com www.votredomaine.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name votredomaine.com www.votredomaine.com;

        ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

#### Étape 5: Backups Automatiques

**Script de backup quotidien:**

```bash
#!/bin/bash
# backup.sh - Backup automatique quotidien

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U postgres reexpresstrack > "$BACKUP_DIR/db_$DATE.sql"

# Backup MinIO (fichiers)
docker-compose exec -T minio mc mirror /data "$BACKUP_DIR/minio_$DATE"

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type f -mtime +7 -delete

# Compresser
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/db_$DATE.sql" "$BACKUP_DIR/minio_$DATE"
rm -rf "$BACKUP_DIR/db_$DATE.sql" "$BACKUP_DIR/minio_$DATE"

echo "✅ Backup terminé: backup_$DATE.tar.gz"
```

**Ajouter au cron:**

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne (backup tous les jours à 2h du matin)
0 2 * * * /opt/ReexprssTrack/scripts/backup.sh >> /var/log/backup.log 2>&1
```

---

#### Étape 6: Monitoring (Optionnel mais recommandé)

**Option simple: Uptime Kuma**

```bash
# Ajouter dans docker-compose.yml
uptime-kuma:
  image: louislam/uptime-kuma:1
  container_name: uptime-kuma
  volumes:
    - uptime-kuma:/app/data
  ports:
    - "3001:3001"
  restart: unless-stopped
```

**Ou utiliser un service externe gratuit:**
- UptimeRobot (gratuit)
- Better Uptime (gratuit)
- Pingdom (essai gratuit)

---

## 📋 Checklist Finale de Déploiement

### Pré-déploiement
- [ ] Backend complété et testé localement
- [ ] Frontend complété et testé localement
- [ ] Docker fonctionne en local
- [ ] Variables d'environnement configurées
- [ ] Clés API obtenues (Stripe, 17Track, SMTP)

### VPS Setup
- [ ] VPS loué et accessible via SSH
- [ ] Docker et Docker Compose installés
- [ ] Firewall configuré
- [ ] Nom de domaine pointé vers le VPS
- [ ] SSL/TLS configuré (Certbot)

### Déploiement
- [ ] Code déployé sur le VPS
- [ ] Variables d'environnement production configurées
- [ ] Secrets générés (JWT, etc.)
- [ ] Services Docker démarrés
- [ ] Base de données migrée
- [ ] Nginx configuré
- [ ] Backups automatiques configurés

### Tests Production
- [ ] Site accessible via HTTPS
- [ ] API répond correctement
- [ ] Authentification fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Paiements Stripe fonctionnent
- [ ] Emails sont envoyés
- [ ] Logs sont accessibles

### Post-déploiement
- [ ] Monitoring configuré
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Utilisateurs informés
- [ ] Plan de rollback préparé

---

## 🎯 Timeline Recommandé

### Semaine 1: Développement Backend
- Jour 1-2: Module Packages
- Jour 3-4: Module Quotes
- Jour 5-6: Module Payments
- Jour 7: Module Admin

### Semaine 2: Développement Frontend + Tests
- Jour 1-2: Auth + Dashboard Client
- Jour 3-4: Dashboard Admin
- Jour 5-6: Pages publiques + Tests
- Jour 7: Tests d'intégration complets

### Semaine 3: Déploiement
- Jour 1: Setup VPS
- Jour 2: Déploiement + Configuration
- Jour 3: SSL + Nginx + Tests production
- Jour 4-5: Monitoring + Backups + Optimisation
- Jour 6-7: Buffer pour imprévus

---

## 💡 Conseils Importants

### Sécurité
1. **Jamais de secrets dans Git** - Toujours utiliser .env
2. **Secrets forts** - Au minimum 32 caractères aléatoires
3. **SSL obligatoire** - Jamais de HTTP en production
4. **Backups réguliers** - Testés et vérifiés
5. **Mises à jour** - Système et dépendances

### Performance
1. **Cache Redis** - Activer pour toutes les requêtes fréquentes
2. **Images optimisées** - Compression avant upload
3. **CDN** - Cloudflare gratuit pour les assets statiques
4. **Monitoring** - Surveiller les métriques

### Coûts
1. **VPS**: ~5-6€/mois (Hetzner/Contabo)
2. **Domaine**: ~10€/an
3. **Email SMTP**: Gratuit (Gmail) ou 5€/mois (SendGrid)
4. **Stripe**: Gratuit (2.9% + 0.30€ par transaction)
5. **Total**: ~15€/mois

---

## 🤔 Quelle Approche Choisir?

### Option A: Développement Complet puis Déploiement (Recommandé)
✅ Avantages:
- Application complète et testée avant mise en ligne
- Moins de bugs en production
- Meilleure expérience utilisateur

❌ Inconvénients:
- Plus long avant le lancement
- Pas de feedback utilisateur précoce

**Durée totale: 2-3 semaines**

### Option B: MVP puis Déploiement Rapide
✅ Avantages:
- Lancement rapide (1 semaine)
- Feedback utilisateur précoce
- Validation du concept

❌ Inconvénients:
- Fonctionnalités limitées
- Possibles bugs
- Développement en production risqué

**Durée MVP: 1 semaine, puis améliorations continues**

---

## ❓ Question pour Vous

**Quelle approche préférez-vous?**

1. **Option A - Complet** (2-3 semaines)
   - Je développe TOUT (backend + frontend complets)
   - Tests approfondis en local
   - Puis déploiement sur VPS

2. **Option B - MVP** (1 semaine)
   - Je développe le minimum viable (auth + colis + devis basique)
   - Déploiement rapide
   - Puis ajout progressif de fonctionnalités

3. **Option C - Par étapes** (3-4 semaines)
   - Je fais d'abord le backend complet + tests (1.5 semaines)
   - Puis le frontend (1.5 semaines)
   - Puis déploiement (1 semaine)

**Dites-moi ce que vous préférez et je commence immédiatement! 🚀**
