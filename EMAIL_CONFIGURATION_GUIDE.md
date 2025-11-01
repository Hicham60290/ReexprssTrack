# 📧 Guide de Configuration des Emails - ReExpressTrack

Ce guide explique comment configurer et utiliser le système d'emails transactionnels de ReExpressTrack.

## 📋 Table des Matières

1. [Types d'Emails Disponibles](#types-demails-disponibles)
2. [Configuration SMTP](#configuration-smtp)
3. [Configuration Gmail](#configuration-gmail)
4. [Configuration Autres Fournisseurs](#configuration-autres-fournisseurs)
5. [Templates d'Emails](#templates-demails)
6. [Utilisation du Service](#utilisation-du-service)
7. [Test des Emails](#test-des-emails)
8. [Dépannage](#dépannage)

---

## 📬 Types d'Emails Disponibles

Le système envoie automatiquement les emails suivants :

| Type | Déclencheur | Respect des préférences |
|------|-------------|-------------------------|
| **🎉 Bienvenue** | Après inscription | Non (toujours envoyé) |
| **📧 Confirmation email** | Après inscription | Non (toujours envoyé) |
| **🔐 Reset mot de passe** | Demande reset | Non (toujours envoyé) |
| **📦 Colis reçu** | Colis arrive à l'entrepôt | ✅ Oui (préférences) |
| **🚚 Colis expédié** | Colis part de l'entrepôt | ✅ Oui (préférences) |
| **✅ Colis livré** | Colis est livré | ✅ Oui (préférences) |
| **💰 Devis créé** | Nouveau devis | ✅ Oui (préférences) |
| **🎁 Invitation** | Utilisateur invite un ami | Non (toujours envoyé) |

---

## ⚙️ Configuration SMTP

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration SMTP
SMTP_HOST=smtp.gmail.com          # Serveur SMTP
SMTP_PORT=587                      # Port SMTP (587 pour TLS, 465 pour SSL)
SMTP_SECURE=false                  # true pour port 465, false pour autres
SMTP_USER=your-email@gmail.com     # Votre email
SMTP_PASS=your-app-password        # Mot de passe d'application
SMTP_FROM_EMAIL=noreply@reexpresstrack.com  # Email expéditeur
SMTP_FROM_NAME=ReExpressTrack      # Nom affiché
```

---

## 📮 Configuration Gmail

### Étape 1 : Activer l'A2F (Authentification à 2 Facteurs)

1. Allez sur https://myaccount.google.com/security
2. Cliquez sur "Validation en deux étapes"
3. Suivez les instructions pour activer l'A2F

### Étape 2 : Créer un Mot de Passe d'Application

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Entrez "ReExpressTrack" comme nom
4. Cliquez sur "Générer"
5. **Copiez le mot de passe** (16 caractères)

### Étape 3 : Configurer le .env

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Le mot de passe généré (sans espaces)
SMTP_FROM_EMAIL=noreply@reexpresstrack.com
SMTP_FROM_NAME=ReExpressTrack
```

### ⚠️ Important Gmail

- Utilisez un **mot de passe d'application**, pas votre mot de passe Gmail
- Ne partagez jamais ce mot de passe
- Vous pouvez le révoquer à tout moment

---

## 📧 Configuration Autres Fournisseurs

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.votre-api-key
SMTP_FROM_EMAIL=noreply@reexpresstrack.com
SMTP_FROM_NAME=ReExpressTrack
```

### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM_EMAIL=noreply@reexpresstrack.com
SMTP_FROM_NAME=ReExpressTrack
```

### OVH

```bash
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@votredomaine.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM_EMAIL=noreply@reexpresstrack.com
SMTP_FROM_NAME=ReExpressTrack
```

### Office 365 / Outlook

```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
SMTP_FROM_EMAIL=noreply@reexpresstrack.com
SMTP_FROM_NAME=ReExpressTrack
```

---

## 🎨 Templates d'Emails

Tous les emails utilisent un template HTML responsive avec :

- ✅ Design moderne avec gradient orange/pink/purple
- ✅ Logo ReExpressTrack en header
- ✅ Boutons call-to-action
- ✅ Footer avec liens sociaux
- ✅ Lien de désinscription
- ✅ Mobile-responsive

### Aperçu des Templates

#### Email de Bienvenue
```
🎉 Bienvenue [Prénom] !
- Message de bienvenue personnalisé
- Explication des prochaines étapes
- Bouton "Accéder à mon espace"
```

#### Confirmation d'Email
```
📧 Confirmez votre adresse email
- Lien de vérification (expire en 24h)
- Instructions claires
- Bouton "Confirmer mon email"
```

#### Reset Mot de Passe
```
🔐 Réinitialisation de mot de passe
- Lien sécurisé (expire en 1h)
- Conseils de sécurité
- Bouton "Réinitialiser mon mot de passe"
```

#### Colis Reçu
```
📦 Votre colis est arrivé !
- Numéro de tracking
- Description du colis
- Bouton "Suivre mon colis"
```

---

## 💻 Utilisation du Service Email

### Import du Service

```typescript
import emailService from '@/services/email.service.js';
```

### Exemples d'Utilisation

#### 1. Email de Bienvenue (Inscription)

```typescript
// Dans auth.service.ts après création de compte
await emailService.sendWelcomeEmail(user.email, {
  firstName: user.profile.firstName,
  email: user.email,
});
```

#### 2. Confirmation d'Email

```typescript
// Génrer un token de vérification
const verificationToken = generateVerificationToken(user.id);
const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

await emailService.sendEmailVerification(
  user.email,
  verificationLink,
  user.profile.firstName
);
```

#### 3. Reset Mot de Passe

```typescript
// Générer un token de reset
const resetToken = generateResetToken(user.id);
const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

await emailService.sendPasswordReset(user.email, {
  firstName: user.profile.firstName,
  resetLink,
  expiresIn: '1 heure',
});
```

#### 4. Notification de Colis

```typescript
// Vérifier les préférences d'abord
const prefs = await prisma.emailPreference.findUnique({
  where: { userId: user.id }
});

if (prefs?.packageReceived) {
  await emailService.sendPackageReceivedEmail(user.email, {
    firstName: user.profile.firstName,
    trackingNumber: package.trackingNumber,
    status: 'Reçu',
    description: package.description,
    trackingLink: `${process.env.FRONTEND_URL}/tracking`,
  });
}
```

#### 5. Devis Créé

```typescript
if (prefs?.quoteCreated) {
  await emailService.sendQuoteCreatedEmail(user.email, {
    firstName: user.profile.firstName,
    quoteId: quote.id,
    destination: quote.destination,
    amount: quote.totalAmount,
    quoteLink: `${process.env.FRONTEND_URL}/quotes/${quote.id}`,
  });
}
```

---

## 🧪 Test des Emails

### 1. Tester la Connexion SMTP

Créer un script de test : `backend/scripts/test-email.ts`

```typescript
import emailService from '../src/services/email.service.js';

async function testEmail() {
  console.log('🧪 Test de l\'envoi d\'email...');

  const success = await emailService.sendEmail({
    to: 'votre-email-test@example.com',
    subject: 'Test ReExpressTrack',
    html: '<h1>Email de test</h1><p>Si vous recevez ceci, la configuration SMTP fonctionne !</p>',
  });

  if (success) {
    console.log('✅ Email envoyé avec succès !');
  } else {
    console.log('❌ Échec de l\'envoi');
  }
}

testEmail();
```

Exécuter :
```bash
cd backend
npm run dev
# Puis dans un autre terminal:
tsx scripts/test-email.ts
```

### 2. Vérifier les Logs

Les logs affichent :
```
✅ SMTP connection verified successfully
Email sent successfully to user@example.com: <message-id>
```

En cas d'erreur :
```
❌ SMTP connection failed: [erreur détaillée]
Failed to send email to user@example.com: [erreur]
```

---

## 🔧 Dépannage

### Erreur : "Invalid login"

**Causes possibles :**
- Mauvais email/mot de passe
- A2F non activé (Gmail)
- Pas de mot de passe d'application (Gmail)

**Solution :**
1. Vérifier SMTP_USER et SMTP_PASS dans .env
2. Activer l'A2F sur Gmail
3. Générer un nouveau mot de passe d'application

### Erreur : "Connection timeout"

**Causes possibles :**
- Mauvais SMTP_HOST ou SMTP_PORT
- Pare-feu bloque le port 587

**Solution :**
1. Vérifier SMTP_HOST et SMTP_PORT
2. Essayer le port 465 avec SMTP_SECURE=true
3. Vérifier le pare-feu

### Erreur : "Self-signed certificate"

**Solution :**
Ajouter dans email.service.ts :

```typescript
this.transporter = nodemailer.createTransporter({
  // ... config
  tls: {
    rejectUnauthorized: false  // Ajouter ceci (développement uniquement)
  }
});
```

### Les emails vont dans SPAM

**Solutions :**
1. Configurer SPF/DKIM pour votre domaine
2. Utiliser un service dédié (SendGrid, Mailgun)
3. Vérifier le contenu des emails (pas de mots spam)
4. Demander aux utilisateurs de mettre en liste blanche

### Emails ne s'envoient pas

**Checklist :**
- [ ] Variables .env correctement configurées
- [ ] Service email importé correctement
- [ ] Connexion SMTP vérifiée (logs)
- [ ] Pas d'erreur dans les logs
- [ ] Préférences email activées (pour emails optionnels)

---

## 📊 Monitoring des Emails

### Logs à Surveiller

```bash
# Voir les logs en temps réel
cd backend
npm run dev

# Chercher les erreurs
grep -i "email" logs/*.log
grep -i "smtp" logs/*.log
```

### Métriques Importantes

- Taux de délivrabilité (combien sont envoyés)
- Taux d'ouverture (combien sont ouverts)
- Taux de clic (combien cliquent sur les liens)
- Taux de spam (combien vont en spam)

### Outils de Monitoring

Pour production, considérer :
- **SendGrid** : Analytics intégrées
- **Mailgun** : Tracking détaillé
- **Postmark** : Focus sur transactionnel

---

## 🚀 Prochaines Étapes

1. **Configurer SMTP** dans .env
2. **Tester** l'envoi d'email
3. **Intégrer** dans les actions utilisateur (inscription, reset, etc.)
4. **Surveiller** les logs
5. **Optimiser** les templates si besoin

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier les logs du backend
2. Tester la connexion SMTP manuellement
3. Consulter la documentation du fournisseur SMTP
4. Créer une issue sur GitHub

---

**Note** : En production, utilisez un service email dédié (SendGrid, Mailgun, etc.) plutôt que Gmail pour garantir une meilleure délivrabilité.
