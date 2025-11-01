# ✅ Checklist Pré-Déploiement ReExpressTrack

Liste de vérification rapide avant de déployer sur le VPS.

---

## 🔧 1. Préparation du Code

### Backend
- [ ] Tous les commits poussés sur GitHub
- [ ] Aucune erreur TypeScript : `npm run build`
- [ ] Tests passent : `npm test` (si vous avez des tests)
- [ ] Migrations Prisma prêtes
- [ ] `.env.example` à jour avec toutes les variables

### Frontend
- [ ] Build fonctionne : `npm run build`
- [ ] Aucune erreur ESLint
- [ ] Variables d'environnement documentées
- [ ] Assets optimisés (images compressées)

---

## 🔑 2. Services Externes à Configurer

### Resend (Emails)
- [ ] Compte créé sur https://resend.com
- [ ] Clé API production obtenue (commence par `re_`)
- [ ] Domaine vérifié (ou utiliser `onboarding@resend.dev` pour tests)
- [ ] DNS configurés (SPF, DKIM, DMARC)

### Stripe (Paiements)
- [ ] Compte Stripe vérifié
- [ ] Mode production activé
- [ ] Clés production obtenues :
  - [ ] `sk_live_...` (Secret Key)
  - [ ] `pk_live_...` (Publishable Key)
- [ ] Webhook configuré pour production
- [ ] Webhook secret récupéré : `whsec_...`

### 17Track (Tracking)
- [ ] Compte créé
- [ ] Clé API obtenue
- [ ] Limites API comprises (nombre de requêtes)

---

## 🖥️ 3. VPS et Domaine

### VPS
- [ ] VPS loué (minimum 4GB RAM, 2 vCPUs)
- [ ] Ubuntu 22.04 LTS installé
- [ ] Accès root SSH fonctionnel
- [ ] IP publique obtenue

### Domaine
- [ ] Domaine acheté (ex: reexpresstrack.com)
- [ ] Accès au panneau DNS
- [ ] Enregistrements DNS à créer :
  ```
  A     @                    VOTRE_IP_VPS
  A     www                  VOTRE_IP_VPS
  A     api                  VOTRE_IP_VPS
  ```

---

## 🔐 4. Secrets et Sécurité

### Secrets à Générer

**JWT Secrets** (PRODUCTION - différents du développement !)
```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer JWT_REFRESH_SECRET (différent !)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] JWT_SECRET généré et sauvegardé
- [ ] JWT_REFRESH_SECRET généré et sauvegardé
- [ ] Mot de passe PostgreSQL fort créé
- [ ] Mot de passe MinIO créé
- [ ] Tous les secrets stockés en sécurité (gestionnaire de mots de passe)

### Variables d'Environnement Production

Créer un fichier `.env.production` avec :

```bash
NODE_ENV=production
DATABASE_URL="postgresql://reexpress:PASSWORD@localhost:5432/reexpresstrack"
JWT_SECRET=votre_secret_jwt_64_chars
JWT_REFRESH_SECRET=votre_refresh_secret_64_chars
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FRONTEND_URL=https://reexpresstrack.com
CORS_ORIGIN=https://reexpresstrack.com,https://www.reexpresstrack.com
```

- [ ] Fichier `.env.production` créé localement
- [ ] Toutes les variables renseignées
- [ ] Aucune donnée de développement (localhost, test, etc.)

---

## 📦 5. Services à Installer sur le VPS

### Logiciels Requis
- [ ] Node.js 20.x LTS
- [ ] PostgreSQL 15
- [ ] Redis
- [ ] Nginx
- [ ] Certbot (SSL)
- [ ] PM2 (Process manager)
- [ ] MinIO (ou alternative S3)
- [ ] Git

### Commandes Rapides

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Certbot
sudo apt install -y certbot python3-certbot-nginx

# PM2
sudo npm install -g pm2
```

- [ ] Toutes les installations terminées
- [ ] Tous les services démarrés (`systemctl status`)

---

## 🗄️ 6. Base de Données

- [ ] PostgreSQL installé
- [ ] Base de données `reexpresstrack` créée
- [ ] Utilisateur `reexpress` créé avec mot de passe
- [ ] Privilèges accordés
- [ ] Connexion testée depuis le VPS
- [ ] Migrations Prisma exécutées : `npx prisma migrate deploy`

---

## 🔒 7. Sécurité du VPS

### Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

- [ ] Firewall activé
- [ ] Ports 80, 443, 22 ouverts
- [ ] Status vérifié : `sudo ufw status`

### SSH Sécurisé
- [ ] Utilisateur non-root créé
- [ ] Login root désactivé (`PermitRootLogin no`)
- [ ] Authentification par mot de passe désactivée
- [ ] Clés SSH configurées
- [ ] Fail2Ban installé et configuré

### Mises à Jour
- [ ] Système à jour : `sudo apt update && sudo apt upgrade -y`
- [ ] Updates automatiques configurées (unattended-upgrades)

---

## 📊 8. Monitoring et Logs

- [ ] PM2 configuré pour démarrer au boot
- [ ] Logs PM2 accessibles : `pm2 logs`
- [ ] Log rotation configurée : `pm2 install pm2-logrotate`
- [ ] Nginx logs configurés
- [ ] Espace disque surveillé

---

## 🧪 9. Tests Avant Production

### Tests Locaux
- [ ] Application build sans erreur
- [ ] Inscription utilisateur fonctionne
- [ ] Login fonctionne
- [ ] Emails de test reçus (Resend)
- [ ] Upload de fichiers fonctionne
- [ ] Paiement Stripe mode test fonctionne

### Tests sur VPS (après déploiement)
- [ ] API répond : `curl https://api.reexpresstrack.com/health`
- [ ] Frontend accessible : https://reexpresstrack.com
- [ ] SSL actif (cadenas vert)
- [ ] Inscription fonctionne en production
- [ ] Emails envoyés (vérifier Resend dashboard)
- [ ] Paiement Stripe production testé (petit montant)

---

## 💾 10. Backups

- [ ] Script backup PostgreSQL créé
- [ ] Cron job configuré (tous les jours à 2h)
- [ ] Backup MinIO/uploads configuré
- [ ] Tests de restauration effectués
- [ ] Backups stockés hors du serveur (optionnel mais recommandé)

---

## 📄 11. Documentation

- [ ] README.md à jour
- [ ] Guide de déploiement lu (DEPLOYMENT_GUIDE.md)
- [ ] Variables d'environnement documentées
- [ ] Procédures de maintenance documentées
- [ ] Contacts d'urgence notés

---

## 🚀 12. Go Live !

### Étapes Finales
1. [ ] DNS propagés (vérifier : `nslookup reexpresstrack.com`)
2. [ ] SSL installé (Certbot)
3. [ ] Application déployée (PM2)
4. [ ] Nginx configuré et redémarré
5. [ ] Tests post-déploiement passés
6. [ ] Monitoring actif

### Communication
- [ ] Équipe informée du déploiement
- [ ] Procédure de rollback préparée
- [ ] Contacts d'urgence disponibles

---

## ⚠️ Points d'Attention

### Sécurité
⚠️ **Ne JAMAIS** :
- Utiliser les mêmes secrets JWT qu'en développement
- Commiter les fichiers `.env` avec des secrets
- Utiliser `root` pour l'application
- Laisser les ports inutiles ouverts
- Ignorer les mises à jour de sécurité

### Performance
⚠️ **Vérifier** :
- Redis fonctionne (cache)
- Connexions PostgreSQL limitées (max_connections)
- Gzip activé dans Nginx
- Assets frontend minifiés
- Images optimisées

### Coûts
💰 **Budget mensuel estimé** :
- VPS 4GB : 7-24€/mois
- Domaine : 10€/an
- Resend : Gratuit (3000 emails/mois) puis 20$/mois
- Stripe : 1.4% + 0.25€ par transaction
- Total minimum : ~10-30€/mois

---

## 📞 Support et Urgences

### En cas de problème

1. **Vérifier les logs** :
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Redémarrer les services** :
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   sudo systemctl restart postgresql
   ```

3. **Vérifier le statut** :
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

### Contacts Utiles
- Support OVH : https://www.ovh.com/fr/support/
- Support Resend : https://resend.com/support
- Support Stripe : https://support.stripe.com/

---

## ✅ Validation Finale

Avant de dire "c'est déployé" :

- [ ] Application accessible publiquement
- [ ] SSL valide et actif
- [ ] Emails fonctionnent
- [ ] Paiements fonctionnent
- [ ] Backups automatiques actifs
- [ ] Monitoring en place
- [ ] Documentation à jour
- [ ] Équipe formée

---

🎉 **Prêt pour le déploiement !**

Suivez le guide détaillé dans `DEPLOYMENT_GUIDE.md` pour les instructions étape par étape.
