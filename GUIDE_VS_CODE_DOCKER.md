# 🚀 Guide Complet - Visual Studio Code & Docker

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Ouvrir le Projet dans VS Code](#ouvrir-le-projet-dans-vs-code)
4. [Lancer avec Docker](#lancer-avec-docker)
5. [Développement dans VS Code](#développement-dans-vs-code)
6. [Commandes Utiles](#commandes-utiles)
7. [Débogage](#débogage)
8. [Extensions Recommandées](#extensions-recommandées)

---

## 📦 Prérequis

### 1. Installer Visual Studio Code
```bash
# Windows
# Télécharger depuis: https://code.visualstudio.com/

# macOS (avec Homebrew)
brew install --cask visual-studio-code

# Linux (Ubuntu/Debian)
sudo snap install code --classic
```

### 2. Installer Docker Desktop
```bash
# Windows & macOS
# Télécharger depuis: https://www.docker.com/products/docker-desktop/

# Linux (Ubuntu)
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
# Redémarrer la session
```

### 3. Vérifier l'Installation
```bash
# Vérifier Docker
docker --version
docker-compose --version

# Vérifier VS Code
code --version
```

---

## 🎯 Installation du Projet

### Option 1: Cloner depuis Git (Recommandé)
```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/reexpresstrack.git
cd reexpresstrack

# 2. Ouvrir dans VS Code
code .
```

### Option 2: Décompresser l'Archive
```bash
# 1. Décompresser l'archive
unzip reexpresstrack.zip
cd reexpresstrack

# 2. Ouvrir dans VS Code
code .
```

---

## 💻 Ouvrir le Projet dans VS Code

### Première Ouverture

1. **Ouvrir le dossier du projet**
   - Menu: `Fichier` → `Ouvrir le dossier...`
   - Sélectionner le dossier `reexpresstrack`

2. **Installer les Extensions Recommandées**
   - VS Code affichera une notification en bas à droite
   - Cliquer sur "Installer" pour installer toutes les extensions recommandées
   - OU: `Ctrl+Shift+P` → `Extensions: Show Recommended Extensions`

3. **Faire Confiance au Dossier**
   - Cliquer sur "Oui, je fais confiance aux auteurs"

### Structure du Projet dans l'Explorateur

```
reexpresstrack/
├── 📁 .vscode/              # Configuration VS Code
│   ├── settings.json       # Paramètres de l'éditeur
│   ├── extensions.json     # Extensions recommandées
│   ├── launch.json         # Configurations de débogage
│   └── tasks.json          # Tâches automatisées
├── 📁 backend/             # API Backend
│   ├── src/               # Code source
│   ├── prisma/            # Schéma de base de données
│   ├── Dockerfile         # Image Docker
│   └── package.json
├── 📁 frontend/            # Application React
│   ├── src/               # Code source
│   ├── Dockerfile         # Image Docker
│   └── package.json
├── docker-compose.yml      # Orchestration Docker
└── README.md              # Documentation
```

---

## 🐳 Lancer avec Docker

### Méthode 1: Avec VS Code Tasks (Recommandé)

1. **Ouvrir la Palette de Commandes**
   - Raccourci: `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)

2. **Exécuter la Tâche "Start All Services"**
   - Taper: `Tasks: Run Task`
   - Sélectionner: `🐳 Docker: Start All Services`

3. **Attendre le Démarrage**
   - Le terminal intégré affichera les logs
   - Attendre que tous les services soient "healthy"

### Méthode 2: Terminal Intégré

1. **Ouvrir le Terminal**
   - Raccourci: `` Ctrl+` `` (backtick)
   - OU Menu: `Terminal` → `Nouveau Terminal`

2. **Lancer Docker Compose**
   ```bash
   # Démarrer tous les services
   docker-compose up -d
   
   # Voir les logs en temps réel
   docker-compose logs -f
   
   # Vérifier l'état des services
   docker-compose ps
   ```

### Méthode 3: Docker Extension (Interface Graphique)

1. **Ouvrir l'Extension Docker**
   - Icône Docker dans la barre latérale
   - OU: `Ctrl+Shift+E` → Cliquer sur "Docker"

2. **Clic Droit sur docker-compose.yml**
   - `Compose Up`
   - Voir les containers dans l'extension

---

## 🎨 Développement dans VS Code

### Accéder aux Services

| Service | URL | Raccourci VS Code |
|---------|-----|-------------------|
| Frontend | http://localhost:5173 | `Alt+Shift+O` → Entrer URL |
| Backend API | http://localhost:3000 | `Alt+Shift+O` → Entrer URL |
| API Docs (Swagger) | http://localhost:3000/docs | - |
| Adminer (DB) | http://localhost:8080 | - |
| Redis Commander | http://localhost:8081 | - |
| MinIO Console | http://localhost:9001 | - |
| Prisma Studio | `npm run prisma:studio` | Tâche disponible |

### Workflow de Développement

#### 1. Développement Backend

```bash
# Terminal 1: Lancer le backend en mode dev
cd backend
npm install
npm run dev

# Terminal 2: Prisma Studio (optionnel)
npm run prisma:studio
```

**OU avec VS Code Tasks:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `🚀 Backend: Dev`

#### 2. Développement Frontend

```bash
# Terminal 1: Lancer le frontend en mode dev
cd frontend
npm install
npm run dev
```

**OU avec VS Code Tasks:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `🌐 Frontend: Dev`

#### 3. Full Stack (Backend + Frontend)

**Avec VS Code:**
1. Ouvrir le panneau "Run and Debug" (`Ctrl+Shift+D`)
2. Sélectionner "🚀 Full Stack: Debug"
3. Appuyer sur F5

---

## 🔧 Commandes Utiles dans VS Code

### Raccourcis Clavier Essentiels

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Palette de commandes | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Terminal | `` Ctrl+` `` | `` Cmd+` `` |
| Rechercher fichier | `Ctrl+P` | `Cmd+P` |
| Rechercher texte | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Formater document | `Shift+Alt+F` | `Shift+Option+F` |
| Multi-curseur | `Alt+Click` | `Option+Click` |
| Split editor | `Ctrl+\` | `Cmd+\` |

### Tâches Disponibles (Ctrl+Shift+P → Tasks: Run Task)

#### Docker
- `🐳 Docker: Start All Services` - Démarrer tous les services
- `🐳 Docker: Stop All Services` - Arrêter tous les services
- `🐳 Docker: Rebuild Services` - Rebuild et redémarrer
- `🐳 Docker: View Logs` - Voir les logs en temps réel
- `🐳 Docker: Clean All` - Nettoyer tout (volumes inclus)

#### Backend
- `🚀 Backend: Dev` - Mode développement
- `🚀 Backend: Build` - Build TypeScript
- `🚀 Backend: Start` - Démarrer en production
- `🧪 Backend: Test` - Lancer les tests
- `🧪 Backend: Test Coverage` - Tests avec coverage

#### Prisma
- `🗄️ Prisma: Generate` - Générer le client Prisma
- `🗄️ Prisma: Migrate Dev` - Créer/appliquer migrations
- `🗄️ Prisma: Studio` - Ouvrir Prisma Studio
- `🗄️ Prisma: Seed` - Ajouter des données de test

#### Frontend
- `🌐 Frontend: Dev` - Mode développement
- `🌐 Frontend: Build` - Build pour production
- `🌐 Frontend: Preview` - Prévisualiser le build
- `🧪 Frontend: Test` - Lancer les tests

#### Code Quality
- `🔍 Lint: All` - Linter tout le code
- `✨ Format: All` - Formater tout le code

---

## 🐛 Débogage

### Déboguer le Backend

1. **Avec Docker**
   - Ouvrir "Run and Debug" (`Ctrl+Shift+D`)
   - Sélectionner "🐳 Backend: Attach Docker"
   - F5 pour commencer

2. **Sans Docker (Local)**
   - Sélectionner "🚀 Backend: Debug"
   - F5 pour commencer
   - Placer des breakpoints en cliquant à gauche des numéros de ligne

### Déboguer le Frontend

1. **Avec Chrome**
   - Sélectionner "🌐 Frontend: Chrome"
   - F5 pour ouvrir Chrome avec le debugger

2. **Avec Edge**
   - Sélectionner "🌐 Frontend: Edge"
   - F5 pour ouvrir Edge avec le debugger

### Déboguer Full Stack

- Sélectionner "🚀 Full Stack: Debug"
- Lance backend + frontend simultanément
- F5 pour commencer

### Breakpoints et Inspection

```typescript
// Placer un breakpoint en cliquant à gauche du numéro de ligne
function calculerTotal(items: Item[]) {
  let total = 0; // ← Clic ici pour placer un breakpoint
  
  for (const item of items) {
    total += item.price;
  }
  
  return total;
}
```

**Contrôles de débogage:**
- `F5` - Continuer
- `F10` - Step Over (passer à la ligne suivante)
- `F11` - Step Into (entrer dans la fonction)
- `Shift+F11` - Step Out (sortir de la fonction)
- `Ctrl+Shift+F5` - Redémarrer
- `Shift+F5` - Arrêter

---

## 🔌 Extensions Recommandées

VS Code vous proposera automatiquement ces extensions. Voici les plus importantes:

### Essentielles
- **ESLint** - Détection d'erreurs JavaScript/TypeScript
- **Prettier** - Formatage automatique du code
- **Error Lens** - Affichage inline des erreurs
- **EditorConfig** - Configuration cohérente de l'éditeur

### TypeScript & React
- **ES7+ React Snippets** - Snippets React
- **Simple React Snippets** - Snippets React simples
- **Import Cost** - Affiche la taille des imports

### Database & Backend
- **Prisma** - Support Prisma ORM
- **Docker** - Gestion Docker
- **REST Client** - Tester les APIs
- **Thunder Client** - Client REST GUI

### Git
- **GitLens** - Superpuissances Git
- **Git Graph** - Visualiser l'historique Git

### Productivité
- **Path Intellisense** - Autocomplétion des chemins
- **Auto Rename Tag** - Renommer les tags HTML ensemble
- **Material Icon Theme** - Icônes de fichiers

---

## 📊 Panel Docker dans VS Code

### Visualiser les Containers

1. **Ouvrir l'Extension Docker**
   - Icône Docker dans la barre latérale

2. **Voir les Containers Actifs**
   - Section "Containers"
   - Clic droit pour: Stop, Restart, View Logs, Attach Shell

3. **Voir les Images**
   - Section "Images"
   - Gérer les images Docker

4. **Voir les Volumes**
   - Section "Volumes"
   - Gérer les volumes de données

### Logs en Temps Réel

**Méthode 1: Extension Docker**
- Clic droit sur un container → "View Logs"

**Méthode 2: Terminal**
```bash
# Logs d'un service spécifique
docker-compose logs -f backend

# Logs de tous les services
docker-compose logs -f

# Logs avec couleurs
docker-compose logs -f --tail=100
```

---

## 🔥 Actions Rapides

### Quick Actions Panel

**Appuyez sur `Ctrl+Shift+P` et tapez:**

```
> Docker: Compose Up          # Démarrer
> Docker: Compose Down        # Arrêter
> Docker: Compose Restart     # Redémarrer
> Docker: View Logs           # Voir logs
> Tasks: Run Task             # Exécuter une tâche
> Prisma: Format              # Formater schema.prisma
> Terminal: Create New        # Nouveau terminal
```

### Snippets Personnalisés

Les snippets React et TypeScript sont automatiquement disponibles:

```typescript
// Taper "rfc" puis Tab
// Génère un React Functional Component

// Taper "rafce" puis Tab  
// Génère un React Arrow Function Component avec export

// Taper "ust" puis Tab
// Génère un useState hook
```

---

## 🎯 Workflow Recommandé

### Démarrage Quotidien

1. **Ouvrir VS Code**
   ```bash
   cd reexpresstrack
   code .
   ```

2. **Démarrer Docker** (si ce n'est pas automatique)
   - `Ctrl+Shift+P` → `Docker: Compose Up`
   - OU: `docker-compose up -d` dans le terminal

3. **Vérifier que tout fonctionne**
   - Ouvrir http://localhost:5173 (Frontend)
   - Ouvrir http://localhost:3000/health (Backend)

4. **Commencer à coder !** 🚀

### Avant de Pousser du Code

1. **Formater le code**
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `✨ Format: All`

2. **Vérifier avec le linter**
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `🔍 Lint: All`

3. **Lancer les tests**
   - Backend: `Ctrl+Shift+P` → `Tasks: Run Task` → `🧪 Backend: Test`
   - Frontend: `Ctrl+Shift+P` → `Tasks: Run Task` → `🧪 Frontend: Test`

4. **Committer et pousser**
   ```bash
   git add .
   git commit -m "feat: ajout de fonctionnalité X"
   git push
   ```

---

## 🆘 Problèmes Courants

### Docker ne démarre pas

```bash
# Vérifier si Docker est en cours d'exécution
docker ps

# Redémarrer Docker Desktop (Windows/Mac)
# OU
sudo systemctl restart docker  # Linux
```

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Tuer le processus
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### Extensions ne s'installent pas

1. Ouvrir l'onglet Extensions (`Ctrl+Shift+X`)
2. Rechercher manuellement chaque extension
3. Cliquer sur "Install"

### Prisma n'est pas reconnu

```bash
cd backend
npm install
npx prisma generate
```

---

## 📚 Ressources

- [Documentation VS Code](https://code.visualstudio.com/docs)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Raccourcis Clavier VS Code](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)

---

## 🎉 Conclusion

Vous êtes maintenant prêt à développer avec **Visual Studio Code et Docker** !

**Commandes de base à retenir:**
- `Ctrl+Shift+P` → Palette de commandes
- `` Ctrl+` `` → Terminal
- `Ctrl+P` → Rechercher fichier
- `F5` → Démarrer le débogage
- `docker-compose up -d` → Démarrer les services

**Bon développement ! 🚀**
