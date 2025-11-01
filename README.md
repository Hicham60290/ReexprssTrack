# 📦 ReExpressTrack - Platform de Réexpédition de Colis

<div align="center">

![ReExpressTrack Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=ReExpressTrack)

**Plateforme moderne de réexpédition de colis pour les DOM-TOM**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb.svg)](https://reactjs.org/)

</div>

---

## 🎯 Vue d'ensemble

ReExpressTrack est une plateforme complète de gestion de réexpédition de colis, conçue spécialement pour les résidents des DOM-TOM. Elle permet de:

✅ Recevoir des colis en France métropolitaine  
✅ Suivre vos colis en temps réel  
✅ Obtenir des devis automatiques multi-transporteurs  
✅ Gérer vos paiements de façon sécurisée  
✅ Consulter vos statistiques et économies  

---

## 🏗️ Architecture

### Stack Technologique

#### Backend
- **Runtime:** Node.js 20+
- **Framework:** Fastify
- **ORM:** Prisma
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Storage:** MinIO (S3-compatible)
- **Queue:** BullMQ
- **Auth:** JWT
- **Validation:** Zod
- **Payments:** Stripe
- **Tracking:** 17Track API

#### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State:** Zustand + React Query
- **UI:** TailwindCSS + Shadcn/ui
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **i18n:** i18next

#### DevOps
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana (optionnel)

---

## 📂 Structure du Projet

```
reexpresstrack/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── modules/           # Modules fonctionnels
│   │   │   ├── auth/         # Authentification ✅
│   │   │   ├── users/        # Gestion utilisateurs ✅
│   │   │   ├── packages/     # Gestion colis ✅
│   │   │   ├── quotes/       # Gestion devis ✅
│   │   │   ├── payments/     # Gestion paiements ✅
│   │   │   ├── admin/        # Administration ✅
│   │   │   └── support/      # Support client ✅
│   │   ├── common/           # Code partagé
│   │   │   ├── database/    # Connexion DB
│   │   │   ├── cache/       # Redis
│   │   │   ├── queue/       # BullMQ
│   │   │   ├── storage/     # MinIO
│   │   │   └── middleware/  # Middlewares
│   │   ├── config/          # Configuration
│   │   └── server.ts        # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de base
│   │   ├── migrations/      # Migrations
│   │   └── seed.ts          # Données de test
│   ├── tests/               # Tests
│   └── package.json
│
├── frontend/                  # Application React
│   ├── src/
│   │   ├── features/         # Features par module
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── packages/
│   │   │   ├── quotes/
│   │   │   └── admin/
│   │   ├── shared/          # Code partagé
│   │   │   ├── components/ # Composants UI
│   │   │   ├── hooks/      # Hooks custom
│   │   │   ├── utils/      # Utilitaires
│   │   │   └── types/      # Types TS
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── nginx/                    # Configuration Nginx
│   └── nginx.conf
│
├── docker-compose.yml        # Stack complète
├── .env.example             # Variables d'environnement
└── README.md                # Ce fichier
```

---

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0.0 (optionnel mais recommandé)
- **Docker Compose** >= 2.20.0 (optionnel)

### Option 1: Avec Docker (Recommandé)

#### 1. Cloner le repository
```bash
git clone https://github.com/votre-username/reexpresstrack.git
cd reexpresstrack
```

#### 2. Configurer l'environnement
```bash
# Backend
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Frontend
cp frontend/.env.example frontend/.env
# Éditer frontend/.env avec vos valeurs
```

#### 3. Démarrer l'infrastructure complète
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

#### 4. Initialiser la base de données
```bash
# Accéder au container backend
docker-compose exec backend sh

# Générer le client Prisma
npm run prisma:generate

# Lancer les migrations
npm run prisma:migrate

# (Optionnel) Ajouter des données de test
npm run prisma:seed
```

#### 5. Accéder aux services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000 | - |
| API Docs | http://localhost:3000/docs | - |
| Adminer (DB) | http://localhost:8080 | postgres/postgres |
| Redis Commander | http://localhost:8081 | - |
| MinIO Console | http://localhost:9001 | minioadmin/minioadmin |

### Option 2: Installation Locale (Sans Docker)

#### 1. Installer PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS (avec Homebrew)
brew install postgresql@16

# Créer la base de données
psql -U postgres
CREATE DATABASE reexpresstrack;
\q
```

#### 2. Installer Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Démarrer Redis
redis-server
```

#### 3. Installer MinIO (optionnel)
```bash
# Télécharger MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

# Démarrer MinIO
./minio server ./data --console-address ":9001"
```

#### 4. Installer les dépendances

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

---

## 🔧 Configuration

### Variables d'Environnement Backend

Voir le fichier `backend/.env.example` pour la liste complète.

Variables essentielles:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/reexpresstrack"
JWT_SECRET="votre-secret-jwt-super-securise"
STRIPE_SECRET_KEY="sk_test_..."
TRACK17_API_KEY="votre-cle-17track"
```

### Variables d'Environnement Frontend

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📚 API Documentation

### Swagger UI

Une documentation interactive complète est disponible à l'adresse:
```
http://localhost:3000/docs
```

### Exemples de Requêtes

#### Inscription
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "MotDePasse123!",
    "firstName": "Jean",
    "lastName": "Dupont"
  }'
```

#### Connexion
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "MotDePasse123!"
  }'
```

#### Récupérer les colis (authentifié)
```bash
curl -X GET http://localhost:3000/api/v1/packages \
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

---

## 🧪 Tests

### Backend

```bash
cd backend

# Tests unitaires
npm test

# Tests avec coverage
npm run test:coverage

# Tests e2e
npm run test:e2e
```

### Frontend

```bash
cd frontend

# Tests unitaires
npm test

# Tests avec UI
npm run test:ui

# Tests e2e (Playwright)
npm run test:e2e
```

---

## 🗄️ Base de Données

### Schéma

Le schéma complet est défini dans `backend/prisma/schema.prisma`.

Tables principales:
- `users` - Utilisateurs
- `profiles` - Profils utilisateurs
- `french_addresses` - Adresses françaises
- `packages` - Colis
- `quotes` - Devis
- `payments` - Paiements
- `subscriptions` - Abonnements
- `tracking_events` - Événements de suivi
- `notifications` - Notifications
- `audit_logs` - Logs d'audit

### Migrations

```bash
# Créer une nouvelle migration
npm run prisma:migrate -- --name add_new_feature

# Appliquer les migrations
npm run prisma:migrate

# Réinitialiser la base
npm run prisma:migrate:reset
```

### Prisma Studio

Interface graphique pour explorer la base de données:
```bash
npm run prisma:studio
```

---

## 🔐 Sécurité

### Authentification

- JWT avec tokens d'accès (15min) et refresh (7j)
- Tokens de refresh stockés dans Redis
- Rate limiting sur toutes les routes
- Hachage bcrypt pour les mots de passe

### Protection des Données

- Chiffrement HTTPS obligatoire en production
- Headers de sécurité avec Helmet
- Protection CSRF
- Validation stricte avec Zod
- Audit logs pour toutes les actions sensibles

### Bonnes Pratiques

- Ne jamais commiter les fichiers `.env`
- Utiliser des secrets forts (>32 caractères)
- Activer 2FA pour les comptes admin
- Revoir régulièrement les logs d'audit
- Mettre à jour les dépendances régulièrement

---

## 📊 Monitoring (Optionnel)

### Prometheus + Grafana

Vous pouvez ajouter du monitoring en ajoutant ces services au `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🚢 Déploiement en Production

### VPS (Recommandé pour débuter)

#### 1. Préparer le serveur
```bash
# Se connecter au VPS
ssh user@your-server.com

# Installer Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose
```

#### 2. Déployer l'application
```bash
# Cloner le repo
git clone https://github.com/votre-username/reexpresstrack.git
cd reexpresstrack

# Configurer l'environnement
cp backend/.env.example backend/.env
# Éditer avec vos valeurs de production

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier
docker-compose ps
```

#### 3. Configurer le domaine

```bash
# Installer Certbot pour SSL
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

### Kubernetes (Pour la scalabilité)

Des manifests Kubernetes sont disponibles dans le dossier `k8s/`.

```bash
kubectl apply -f k8s/
```

---

## 🐛 Debugging

### Logs Backend

```bash
# Voir tous les logs
docker-compose logs -f backend

# Logs en temps réel d'un service spécifique
docker-compose logs -f postgres
```

### Accéder à la base de données

```bash
# Via Adminer
http://localhost:8080

# Via psql
docker-compose exec postgres psql -U postgres -d reexpresstrack
```

### Vider le cache Redis

```bash
# Via Redis Commander
http://localhost:8081

# Via CLI
docker-compose exec redis redis-cli
> AUTH redis_password
> FLUSHALL
```

---

## 📈 Roadmap

### Backend (100% ✅)
- [x] Architecture de base
- [x] Authentification JWT
- [x] Module Users (profils, adresses, KYC)
- [x] Module Packages (colis, photos, tracking)
- [x] Module Quotes (devis multi-transporteurs, PDF)
- [x] Module Payments (Stripe, webhooks, remboursements)
- [x] Module Admin (dashboard, gestion complète)
- [x] Module Support (tickets, messagerie)
- [x] Intégration 17Track API
- [x] Intégration Stripe complète

### Frontend (À venir)
- [ ] Interface utilisateur React
- [ ] Dashboard client
- [ ] Dashboard admin
- [ ] Interface support
- [ ] Notifications temps réel (WebSocket)
- [ ] Progressive Web App (PWA)

### Futur
- [ ] Système de parrainage
- [ ] IA pour détection contenu colis
- [ ] App mobile React Native
- [ ] Tests automatisés (Jest, Playwright)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions de code (ESLint + Prettier)
- Écrire des tests pour les nouvelles features
- Mettre à jour la documentation
- Garder les commits atomiques et descriptifs

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Auteurs

- **Votre Nom** - *Travail initial* - [VotreGitHub](https://github.com/votre-username)

---

## 🙏 Remerciements

- [Fastify](https://www.fastify.io/) pour le framework backend
- [Prisma](https://www.prisma.io/) pour l'ORM
- [React](https://reactjs.org/) pour le framework frontend
- [Stripe](https://stripe.com/) pour les paiements
- [17Track](https://www.17track.net/) pour le suivi de colis

---

## 📞 Support

Pour toute question ou problème:

- 📧 Email: support@reexpresstrack.com
- 💬 Discord: [Rejoindre notre serveur](https://discord.gg/reexpresstrack)
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/reexpresstrack/issues)

---

<div align="center">

**Fait avec ❤️ pour les DOM-TOM**

[Site Web](https://reexpresstrack.com) • [Documentation](https://docs.reexpresstrack.com) • [Blog](https://blog.reexpresstrack.com)

</div>
