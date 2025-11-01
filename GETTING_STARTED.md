# 🚀 Guide de Démarrage Rapide - Tests Locaux

Guide pour tester **ReExpressTrack** en local avec Docker.

---

## 📋 Prérequis

- **Docker** & **Docker Compose** installés
- **Node.js 20+** (uniquement si vous voulez le backend en local)
- **Git**

---

## 🐳 Option 1: Backend Local + Services Docker (Développement)

**Recommandé pour le développement** - Hot-reload rapide

### 1. Cloner et configurer

```bash
# Cloner le projet
git clone <url-du-repo>
cd ReexprssTrack

# Configurer les variables d'environnement
cd backend
cp .env.example .env

# Éditer .env avec vos clés API:
# - STRIPE_SECRET_KEY (votre clé Stripe)
# - TRACK17_API_KEY (votre clé 17Track)
# - JWT_SECRET (générer une clé aléatoire)
```

### 2. Générer les clés JWT

```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copier les résultats dans votre fichier .env
```

### 3. Démarrer uniquement les services

```bash
# Depuis la racine du projet
docker-compose up -d postgres redis minio adminer redis-commander
```

**Services démarrés:**
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ MinIO (port 9000 API, 9001 Console)
- ✅ Adminer (port 8080) - Interface DB
- ✅ Redis Commander (port 8081) - Interface Redis

### 4. Initialiser la base de données

```bash
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Seed avec données de test
npx prisma db seed
```

### 5. Démarrer le backend

```bash
# Mode développement avec hot-reload
npm run dev
```

**Backend accessible sur:** http://localhost:3000
**Documentation API:** http://localhost:3000/docs

---

## 🐳 Option 2: Tout dans Docker (Production-like)

**Recommandé pour tester le déploiement**

### 1. Configuration

```bash
# Depuis la racine du projet
cp backend/.env.example backend/.env

# Éditer backend/.env avec vos clés API
```

### 2. Démarrer tous les services

```bash
# Build et démarrage
docker-compose up -d --build

# Voir les logs
docker-compose logs -f backend
```

### 3. Initialiser la base de données

```bash
# Entrer dans le container backend
docker-compose exec backend sh

# Générer Prisma et créer les tables
npx prisma generate
npx prisma db push

# Sortir du container
exit
```

**Services accessibles:**
- 🌐 Backend API: http://localhost:3000
- 📚 Documentation: http://localhost:3000/docs
- 🗄️ Adminer (DB): http://localhost:8080
- 📦 MinIO Console: http://localhost:9001
- 🔴 Redis Commander: http://localhost:8081

---

## 🔑 Accès aux Interfaces

### Adminer (PostgreSQL)
- URL: http://localhost:8080
- Serveur: `postgres`
- Utilisateur: `postgres`
- Mot de passe: `postgres`
- Base: `reexpresstrack`

### MinIO Console
- URL: http://localhost:9001
- User: `minioadmin`
- Pass: `minioadmin`

### Redis Commander
- URL: http://localhost:8081
- (Pas d'authentification en local)

---

## 🧪 Tester l'API

### Avec Swagger UI

1. Ouvrir http://localhost:3000/docs
2. Créer un compte: `POST /api/v1/auth/register`
3. Se connecter: `POST /api/v1/auth/login`
4. Copier le `accessToken`
5. Cliquer sur "Authorize" en haut à droite
6. Entrer: `Bearer <votre-token>`
7. Tester tous les endpoints!

### Avec cURL

```bash
# 1. Créer un compte
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0612345678"
  }'

# 2. Se connecter
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# 3. Utiliser le token pour les requêtes suivantes
TOKEN="<votre-access-token>"

# 4. Créer un colis
curl -X POST http://localhost:3000/api/v1/packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "TEST123456",
    "description": "Mon premier colis",
    "weight": 2.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 10
    }
  }'
```

---

## 📊 Vérifier la Santé des Services

```bash
# Health check backend
curl http://localhost:3000/health

# Vérifier PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Vérifier Redis
docker-compose exec redis redis-cli ping

# Vérifier MinIO
curl http://localhost:9000/minio/health/live
```

---

## 🛠️ Commandes Utiles

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f [service_name]

# Rebuild après modifications
docker-compose up -d --build

# Supprimer volumes (⚠️ efface les données)
docker-compose down -v

# Voir les services actifs
docker-compose ps
```

### Prisma

```bash
# Générer le client
npx prisma generate

# Appliquer le schema
npx prisma db push

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Créer une migration
npx prisma migrate dev --name nom_migration

# Reset la DB (⚠️ efface les données)
npx prisma migrate reset
```

### Backend

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linter
npm run lint

# Tests (si configurés)
npm test
```

---

## 🔍 Troubleshooting

### Port déjà utilisé

```bash
# Voir quel processus utilise le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion à PostgreSQL

```bash
# Vérifier que le service est démarré
docker-compose ps postgres

# Voir les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

### Erreur Prisma

```bash
# Regenerer le client Prisma
npx prisma generate

# Réappliquer le schema
npx prisma db push
```

### MinIO bucket n'existe pas

Le backend crée automatiquement le bucket au démarrage. Si erreur:

```bash
# Vérifier les logs backend
docker-compose logs backend

# Ou créer manuellement via MinIO Console
# http://localhost:9001 → Buckets → Create Bucket → "reexpresstrack"
```

---

## 📝 Variables d'Environnement Importantes

### Pour les tests locaux (backend/.env):

```env
# API Keys (à obtenir)
STRIPE_SECRET_KEY=sk_test_... (depuis https://dashboard.stripe.com)
TRACK17_API_KEY=... (depuis https://www.17track.net/en/apikey)

# JWT Secrets (générer avec crypto)
JWT_SECRET=<64 caractères hex aléatoires>
JWT_REFRESH_SECRET=<64 caractères hex aléatoires>

# Services Docker (OK par défaut)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reexpresstrack
REDIS_HOST=localhost
REDIS_PASSWORD=redis_password
MINIO_ENDPOINT=localhost
```

---

## ✅ Checklist de Démarrage

- [ ] Docker installé et démarré
- [ ] Fichier `.env` créé et configuré
- [ ] Clés JWT générées
- [ ] Clé Stripe API ajoutée
- [ ] Clé 17Track API ajoutée
- [ ] Services Docker démarrés
- [ ] Base de données initialisée (Prisma)
- [ ] Backend démarré
- [ ] API accessible sur http://localhost:3000
- [ ] Documentation accessible sur http://localhost:3000/docs
- [ ] Test de création de compte réussi

---

## 🎯 Prochaines Étapes

Une fois les tests locaux fonctionnels:

1. **Développer le Frontend** (React + TypeScript)
2. **Ajouter les tests unitaires** (Jest)
3. **Configurer CI/CD** (GitHub Actions)
4. **Déployer sur VPS** (Guide séparé)

---

## 📚 Ressources

- **Documentation API**: http://localhost:3000/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Fastify Docs**: https://www.fastify.io/docs
- **Stripe Docs**: https://stripe.com/docs/api
- **17Track Docs**: https://www.17track.net/en/apidoc

---

**Bon développement!** 🚀

Si vous rencontrez des problèmes, vérifiez d'abord les logs:
```bash
docker-compose logs -f backend
```
