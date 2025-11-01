# 🚀 ReExpressTrack - Instructions de Déploiement Production

## 📋 Prérequis

Avant de commencer, assurez-vous que le serveur dispose de :

- ✅ Docker Engine (version 20.10+)
- ✅ Docker Compose (version 2.0+)
- ✅ Nginx installé et configuré
- ✅ Certificat SSL Let's Encrypt pour reexpresstrack.com
- ✅ DNS configuré (reexpresstrack.com et www pointant vers 192.162.86.60)
- ✅ Ports disponibles : 3000, 5432, 6380, 8080, 9000, 9001

## 🔧 Étape 1 : Préparer le serveur

### Se connecter au serveur

```bash
ssh administrator@192.162.86.60
```

### Naviguer vers le répertoire du projet

```bash
cd ~/ReexprssTrack
```

### Récupérer les dernières modifications

```bash
git pull origin claude/connect-to-project-011CUh5LTx63QiZ4jUMrQoEP
```

## 🔐 Étape 2 : Vérifier les fichiers d'environnement

Les fichiers `.env` doivent déjà exister :

```bash
ls -la backend/.env frontend/.env
```

Si les fichiers n'existent pas, créez-les :

### backend/.env
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/reexpresstrack?schema=public"

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# JWT
JWT_SECRET=8f4a9c3e7b2d1f6e5c8a7b4d3e2f1a9c8b7d6e5f4a3b2c1d9e8f7a6b5c4d3e2f1
JWT_REFRESH_SECRET=2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b

# CORS
CORS_ORIGIN=https://reexpresstrack.com,https://www.reexpresstrack.com

# Stripe (use your production keys)
STRIPE_SECRET_KEY=rk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# Resend (Email)
RESEND_API_KEY=re_your_resend_api_key_here

# 17Track (Package Tracking)
TRACK17_API_KEY=your_17track_api_key_here

# Frontend URL
FRONTEND_URL=https://reexpresstrack.com

# MinIO (Object Storage)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=reexpresstrack
```

### frontend/.env
```bash
VITE_API_URL=https://reexpresstrack.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
```

## 🐳 Étape 3 : Déployer avec Docker

### Option A : Utiliser le script automatique (Recommandé)

```bash
./DEPLOY.sh
```

Ce script va :
1. ✅ Vérifier que Docker est installé
2. ✅ Vérifier que les fichiers .env existent
3. ✅ Arrêter les conteneurs existants
4. ✅ Construire les images Docker
5. ✅ Démarrer tous les services
6. ✅ Exécuter les migrations de base de données

### Option B : Déploiement manuel

```bash
# Arrêter les conteneurs existants
docker compose -f docker-compose.prod.yml down

# Construire les images
docker compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
docker compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
sleep 10

# Vérifier l'état des services
docker compose -f docker-compose.prod.yml ps

# Exécuter les migrations de base de données
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f
```

## 🌐 Étape 4 : Configurer Nginx

### Copier la configuration Nginx

```bash
sudo cp nginx-production.conf /etc/nginx/sites-available/reexpresstrack
sudo ln -sf /etc/nginx/sites-available/reexpresstrack /etc/nginx/sites-enabled/
```

### Tester la configuration

```bash
sudo nginx -t
```

### Recharger Nginx

```bash
sudo systemctl reload nginx
```

## ✅ Étape 5 : Vérifier le déploiement

### Vérifier que les conteneurs tournent

```bash
docker compose -f docker-compose.prod.yml ps
```

Vous devriez voir :
- ✅ reexpresstrack_postgres (healthy)
- ✅ reexpresstrack_redis (healthy)
- ✅ reexpresstrack_minio (healthy)
- ✅ reexpresstrack_backend (healthy)
- ✅ reexpresstrack_frontend (Up)

### Tester les services localement

```bash
# Backend API
curl http://127.0.0.1:3000/health

# Frontend
curl http://127.0.0.1:8080

# Base de données
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d reexpresstrack -c "SELECT 1;"
```

### Tester via le domaine

```bash
# Test HTTPS
curl -I https://reexpresstrack.com
curl -I https://www.reexpresstrack.com

# Test API
curl https://reexpresstrack.com/health
```

### Vérifier les logs

```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Logs Nginx
sudo tail -f /var/log/nginx/reexpresstrack_access.log
sudo tail -f /var/log/nginx/reexpresstrack_error.log
```

## 🎯 Étape 6 : Tests fonctionnels

### Accéder à l'application

Ouvrez votre navigateur et testez :

1. **Page d'accueil** : https://reexpresstrack.com
2. **Connexion** : https://reexpresstrack.com/login
3. **Inscription** : https://reexpresstrack.com/register
4. **Tableau de bord** (après connexion) : https://reexpresstrack.com/dashboard

### Vérifier les fonctionnalités clés

- [ ] Inscription d'un nouvel utilisateur
- [ ] Connexion avec les identifiants
- [ ] Création d'un colis
- [ ] Suivi d'un colis via 17Track
- [ ] Demande de devis
- [ ] Accès à la console MinIO : http://127.0.0.1:9001

## 🔧 Maintenance

### Commandes utiles

```bash
# Voir l'état des services
docker compose -f docker-compose.prod.yml ps

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart backend

# Accéder à un conteneur
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d reexpresstrack

# Mettre à jour l'application
git pull origin claude/connect-to-project-011CUh5LTx63QiZ4jUMrQoEP
docker compose -f docker-compose.prod.yml up -d --build

# Sauvegarder la base de données
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres reexpresstrack > backup_$(date +%Y%m%d).sql

# Restaurer la base de données
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres reexpresstrack < backup.sql
```

### Surveillance

```bash
# Utilisation des ressources
docker stats

# Espace disque
docker system df

# Nettoyer les images inutilisées
docker system prune -a
```

## 🐛 Résolution de problèmes

### Erreur : Port déjà utilisé

```bash
# Vérifier ce qui utilise le port
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :6380

# Arrêter le service qui utilise le port
sudo systemctl stop [service_name]
```

### Erreur : Conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker compose -f docker-compose.prod.yml logs backend

# Reconstruire l'image
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Erreur : Base de données non accessible

```bash
# Vérifier que PostgreSQL est démarré
docker compose -f docker-compose.prod.yml ps postgres

# Accéder à PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d reexpresstrack

# Réinitialiser la base de données (ATTENTION : perte de données)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que le backend répond
curl http://127.0.0.1:3000/health

# Vérifier la configuration Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Erreur : Frontend affiche une page blanche

```bash
# Vérifier les logs du frontend
docker compose -f docker-compose.prod.yml logs frontend

# Vérifier que le frontend répond
curl http://127.0.0.1:8080

# Vérifier la console du navigateur pour les erreurs JavaScript
```

## 📊 Architecture des services

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
│                           ↓↓                                 │
│                  reexpresstrack.com                          │
│                     (192.162.86.60)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Host)                              │
│                    Ports 80, 443                             │
│   ┌──────────────────────────────────────────────┐          │
│   │  SSL/TLS Termination                         │          │
│   │  Reverse Proxy                               │          │
│   │  Security Headers                            │          │
│   └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
    /api requests                   Everything else
           ↓                              ↓
┌──────────────────────┐      ┌──────────────────────┐
│  Backend Container   │      │  Frontend Container  │
│  127.0.0.1:3000      │      │  127.0.0.1:8080      │
│  (Fastify API)       │      │  (React + Nginx)     │
└──────────────────────┘      └──────────────────────┘
           ↓
           ↓
┌──────────────────────────────────────────────────┐
│              Docker Network                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ PostgreSQL │  │   Redis    │  │   MinIO    │ │
│  │   :5432    │  │   :6379    │  │ :9000/9001 │ │
│  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────┘
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker compose -f docker-compose.prod.yml logs -f`
2. Consultez ce guide de déploiement
3. Vérifiez la documentation dans le repository

## ✅ Checklist de déploiement

- [ ] Serveur accessible via SSH
- [ ] Docker et Docker Compose installés
- [ ] DNS configuré correctement (reexpresstrack.com et www)
- [ ] Certificat SSL valide
- [ ] Fichiers .env créés (backend et frontend)
- [ ] Containers Docker démarrés
- [ ] Migrations de base de données exécutées
- [ ] Nginx configuré et rechargé
- [ ] https://reexpresstrack.com accessible
- [ ] https://www.reexpresstrack.com accessible
- [ ] Redirection HTTP → HTTPS fonctionnelle
- [ ] API backend répond sur /health
- [ ] Tests fonctionnels réussis

---

**Déploiement réalisé pour ReExpressTrack** 🚀
