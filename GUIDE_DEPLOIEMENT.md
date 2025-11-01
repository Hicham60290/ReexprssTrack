# 🚀 Guide de Déploiement - ReExpressTrack

## 📋 Table des matières
1. [État actuel du projet](#état-actuel-du-projet)
2. [Déploiement sur le serveur de production](#déploiement-sur-le-serveur-de-production)
3. [Configuration DNS](#configuration-dns)
4. [Vérification et tests](#vérification-et-tests)
5. [Maintenance](#maintenance)

---

## 🎯 État actuel du projet

### ✅ Ce qui est fait

- ✅ Certificat SSL installé avec succès via Let's Encrypt
- ✅ Domaine `reexpresstrack.com` configuré
- ✅ Application React buildée et prête pour la production
- ✅ Configuration Nginx optimale créée

### ⚠️ Ce qui reste à faire

- ⚠️ Corriger le DNS pour `www.reexpresstrack.com` (pointe actuellement vers `52.37.165.222`)
- ⚠️ Déployer les fichiers buildés sur le serveur
- ⚠️ Configurer Nginx pour servir l'application

---

## 🖥️ Déploiement sur le serveur de production

### 1. Connexion au serveur

```bash
ssh administrator@192.162.86.60
# ou
ssh administrator@cloud-server-10267717
```

### 2. Naviguer vers le répertoire du projet

```bash
cd ~/ReexprssTrack
```

### 3. Transférer les fichiers buildés

Depuis votre machine locale (ou depuis le repository Git) :

**Option A : Via Git (Recommandé)**

```bash
# Sur le serveur
git pull origin claude/connect-to-project-011CUh5LTx63QiZ4jUMrQoEP

# Installer les dépendances
npm install

# Builder le projet
npm run build
```

**Option B : Via SCP (Alternative)**

```bash
# Depuis votre machine locale
scp -r out/ administrator@192.162.86.60:~/ReexprssTrack/
```

### 4. Configurer Nginx

```bash
# Sauvegarder l'ancienne configuration
sudo cp /etc/nginx/sites-enabled/reexpresstrack /etc/nginx/sites-enabled/reexpresstrack.backup

# Copier la nouvelle configuration
sudo cp ~/ReexprssTrack/nginx-production.conf /etc/nginx/sites-available/reexpresstrack

# Créer le lien symbolique (si pas déjà fait)
sudo ln -sf /etc/nginx/sites-available/reexpresstrack /etc/nginx/sites-enabled/reexpresstrack

# Tester la configuration Nginx
sudo nginx -t
```

**⚠️ Important** : Vérifiez que le chemin `root` dans la configuration Nginx correspond bien à l'emplacement de votre dossier `out` :

```nginx
root /home/administrator/ReexprssTrack/out;
```

### 5. Recharger Nginx

```bash
# Recharger la configuration Nginx
sudo systemctl reload nginx

# Ou redémarrer si besoin
sudo systemctl restart nginx
```

### 6. Vérifier le statut

```bash
# Vérifier que Nginx tourne correctement
sudo systemctl status nginx

# Vérifier les logs en temps réel
sudo tail -f /var/log/nginx/reexpresstrack_error.log
```

---

## 🌐 Configuration DNS

### ❌ Problème actuel

Actuellement, votre configuration DNS présente une incohérence :

```bash
$ dig reexpresstrack.com +short
192.162.86.60  ✅ CORRECT

$ dig www.reexpresstrack.com +short
publish.readdy.site.
52.37.165.222  ❌ INCORRECT (devrait être 192.162.86.60)
```

### ✅ Solution

Vous devez modifier la configuration DNS chez votre registrar de domaine :

#### Enregistrements DNS à configurer :

| Type  | Nom | Valeur           | TTL  |
|-------|-----|------------------|------|
| A     | @   | 192.162.86.60    | 3600 |
| A     | www | 192.162.86.60    | 3600 |

Ou utilisez un CNAME pour www :

| Type  | Nom | Valeur              | TTL  |
|-------|-----|---------------------|------|
| A     | @   | 192.162.86.60       | 3600 |
| CNAME | www | reexpresstrack.com. | 3600 |

#### Étapes pour modifier le DNS :

1. **Connectez-vous** à votre registrar de domaine (OVH, Gandi, Namecheap, etc.)
2. **Accédez** à la zone DNS de `reexpresstrack.com`
3. **Supprimez** l'enregistrement actuel pour `www` qui pointe vers `publish.readdy.site`
4. **Ajoutez** un enregistrement A pour `www` pointant vers `192.162.86.60`
5. **Sauvegardez** les modifications

#### Vérification après modification :

```bash
# Attendez quelques minutes (propagation DNS)
# Puis vérifiez :

dig www.reexpresstrack.com +short
# Devrait afficher : 192.162.86.60

# Ou utilisez un service en ligne :
# https://dnschecker.org/#A/www.reexpresstrack.com
```

---

## ✅ Vérification et tests

### 1. Tests locaux sur le serveur

```bash
# Test HTTP local
curl http://localhost

# Test du domaine
curl http://reexpresstrack.com

# Test HTTPS
curl https://reexpresstrack.com

# Test avec www
curl https://www.reexpresstrack.com
```

### 2. Tests depuis un navigateur

Ouvrez les URLs suivantes dans votre navigateur :

- ✅ http://reexpresstrack.com → devrait rediriger vers HTTPS
- ✅ https://reexpresstrack.com → devrait afficher l'application
- ⚠️ http://www.reexpresstrack.com → ne fonctionnera qu'après correction DNS
- ⚠️ https://www.reexpresstrack.com → ne fonctionnera qu'après correction DNS

### 3. Vérifier le certificat SSL

```bash
# Vérifier le certificat SSL
sudo certbot certificates

# Tester le renouvellement automatique
sudo certbot renew --dry-run
```

### 4. Vérifier les performances

```bash
# Tester la compression Gzip
curl -H "Accept-Encoding: gzip" -I https://reexpresstrack.com

# Vérifier les headers de sécurité
curl -I https://reexpresstrack.com
```

---

## 🔧 Maintenance

### Logs Nginx

```bash
# Voir les logs d'accès
sudo tail -f /var/log/nginx/reexpresstrack_access.log

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/reexpresstrack_error.log

# Filtrer les erreurs récentes
sudo grep "error" /var/log/nginx/reexpresstrack_error.log | tail -20
```

### Renouvellement automatique du certificat SSL

Le renouvellement est automatique via Certbot. Vérifiez le timer :

```bash
# Vérifier que le timer est actif
sudo systemctl status certbot.timer

# Tester le renouvellement
sudo certbot renew --dry-run
```

### Mise à jour de l'application

Pour mettre à jour l'application après des modifications :

```bash
cd ~/ReexprssTrack

# Récupérer les dernières modifications
git pull

# Réinstaller les dépendances si nécessaire
npm install

# Rebuilder l'application
npm run build

# Recharger Nginx
sudo systemctl reload nginx
```

### Sauvegarde

```bash
# Sauvegarder le build actuel
cp -r ~/ReexprssTrack/out ~/ReexprssTrack/out.backup.$(date +%Y%m%d)

# Sauvegarder la configuration Nginx
sudo cp /etc/nginx/sites-enabled/reexpresstrack ~/reexpresstrack-nginx.backup.$(date +%Y%m%d)
```

---

## 🐛 Résolution de problèmes

### Erreur 502 Bad Gateway

**Cause** : Nginx ne peut pas se connecter au backend

**Solution** : Ce projet est une application React statique (pas de backend), donc vérifiez :

```bash
# Vérifier que les fichiers existent
ls -la ~/ReexprssTrack/out/

# Vérifier les permissions
sudo chown -R www-data:www-data ~/ReexprssTrack/out/
sudo chmod -R 755 ~/ReexprssTrack/out/
```

### Erreur 404 Not Found

**Cause** : Fichiers non trouvés ou mauvais chemin dans Nginx

**Solution** :

```bash
# Vérifier le chemin dans la configuration Nginx
sudo grep "root" /etc/nginx/sites-enabled/reexpresstrack

# Le chemin doit correspondre à :
# root /home/administrator/ReexprssTrack/out;

# Vérifier que index.html existe
ls -la /home/administrator/ReexprssTrack/out/index.html
```

### Page blanche / Erreurs JavaScript

**Cause** : Variables d'environnement manquantes ou mauvaise URL Supabase

**Solution** :

```bash
# Vérifier le fichier .env
cat ~/ReexprssTrack/.env

# Doit contenir :
# VITE_PUBLIC_SUPABASE_ANON_KEY="..."
# VITE_PUBLIC_SUPABASE_URL="https://ojvvmsqivsiwmgwrikdg.supabase.co"

# Rebuilder si les variables ont changé
npm run build
```

### Problèmes de certificat SSL

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler manuellement si besoin
sudo certbot renew --force-renewal

# Recharger Nginx après renouvellement
sudo systemctl reload nginx
```

---

## 📞 Support

Pour toute question ou problème :

- 📧 Email : support@reexpresstrack.com
- 🌐 Documentation : https://docs.reexpresstrack.com
- 🐛 Issues GitHub : https://github.com/votre-repo/issues

---

## ✅ Checklist de déploiement

- [ ] Connexion SSH au serveur
- [ ] Git pull ou transfert des fichiers
- [ ] `npm install` et `npm run build`
- [ ] Configuration Nginx copiée et vérifiée
- [ ] Test de la configuration Nginx (`sudo nginx -t`)
- [ ] Rechargement de Nginx
- [ ] Correction du DNS pour www.reexpresstrack.com
- [ ] Test HTTP → HTTPS redirect
- [ ] Test de l'application sur https://reexpresstrack.com
- [ ] Test de l'application sur https://www.reexpresstrack.com
- [ ] Vérification des logs
- [ ] Test du certificat SSL
- [ ] Configuration de la sauvegarde automatique

---

<div align="center">

**Déploiement fait avec ❤️ pour ReExpressTrack**

</div>
