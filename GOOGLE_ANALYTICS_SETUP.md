# Google Analytics 4 - Configuration et Utilisation

Ce document explique comment Google Analytics (GA4) est intégré sur ReExpressTrack de manière **conforme au RGPD**.

## 📊 Configuration Actuelle

**ID de Mesure** : `G-Z698JPXVRL`

**Type** : Google Analytics 4 (GA4)

**Statut** : ✅ Configuré et prêt à l'emploi

## 🔒 Conformité RGPD

### Comment ça fonctionne ?

Google Analytics est intégré de manière **conditionnelle** :

1. **Par défaut** : Google Analytics est **DÉSACTIVÉ** ❌
2. **Après consentement** : Si l'utilisateur accepte les cookies analytiques, GA est **ACTIVÉ** ✅
3. **Si refus** : GA reste désactivé et les cookies GA existants sont supprimés 🗑️

### Flux de consentement

```
Utilisateur visite le site
         ↓
Banner de cookies s'affiche
         ↓
    ┌─────────────────────┐
    │ Choix utilisateur   │
    └─────────────────────┘
         ↓                ↓
   ✅ Accepte          ❌ Refuse
         ↓                ↓
   GA chargé         GA désactivé
   Tracking actif    Cookies supprimés
```

## 🛠️ Implémentation Technique

### Composant GoogleAnalytics

Le composant `GoogleAnalytics.tsx` gère automatiquement :

- ✅ Chargement dynamique du script gtag.js (seulement si consentement)
- ✅ Configuration avec anonymisation IP (RGPD)
- ✅ Cookies sécurisés (SameSite=None;Secure)
- ✅ Suppression des cookies GA si l'utilisateur refuse
- ✅ Écoute des changements de préférences (activation/désactivation en temps réel)

### Code

```typescript
// frontend/src/components/GoogleAnalytics.tsx

const GA_MEASUREMENT_ID = 'G-Z698JPXVRL';

export default function GoogleAnalytics() {
  const { preferences } = useCookieConsent();

  useEffect(() => {
    if (preferences.analytics) {
      // Charge Google Analytics
      loadGoogleAnalytics();
    } else {
      // Supprime Google Analytics
      removeGoogleAnalytics();
    }
  }, [preferences.analytics]);

  return null;
}
```

### Intégration dans App.tsx

```typescript
function App() {
  return (
    <Router>
      <CookieBanner />
      <GoogleAnalytics /> {/* ← Ajouté ici */}
      <Routes>
        {/* ... routes */}
      </Routes>
    </Router>
  );
}
```

## 📈 Utilisation de Google Analytics

### Tracking Automatique

**Pages vues** : Automatiquement trackées lors de la navigation

**Événements automatiques** (par GA4) :
- `page_view` : Chaque page visitée
- `session_start` : Début de session
- `first_visit` : Première visite
- `scroll` : Scroll de la page
- `click` : Clics sur les liens

### Tracking d'Événements Personnalisés (Optionnel)

Vous pouvez tracker des événements personnalisés en utilisant la fonction `trackEvent` :

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

// Exemple : Tracking d'une inscription
trackEvent('sign_up', {
  method: 'email',
  user_id: user.id
});

// Exemple : Tracking d'un devis créé
trackEvent('quote_created', {
  destination: 'Guadeloupe',
  weight: 2.5,
  value: 150
});

// Exemple : Tracking d'un clic sur "S'abonner"
trackEvent('click_subscribe', {
  plan: 'Premium',
  price: 2.50
});
```

### Événements Recommandés à Tracker

| Événement | Nom | Paramètres |
|-----------|-----|------------|
| Inscription | `sign_up` | `method: 'email'` |
| Connexion | `login` | `method: 'email'` |
| Création devis | `generate_lead` | `destination, weight, value` |
| Abonnement | `purchase` | `plan, value, currency: 'EUR'` |
| Déclaration colis | `add_to_cart` | `weight, description` |
| Contact formulaire | `generate_lead` | `subject` |

## 📊 Google Analytics Dashboard

### Accès au Dashboard

1. Allez sur : [Google Analytics](https://analytics.google.com/)
2. Connectez-vous avec votre compte Google
3. Sélectionnez la propriété `ReExpressTrack` (G-Z698JPXVRL)

### Rapports Importants

**Temps réel** :
- Voir les utilisateurs actuellement sur le site
- Pages en cours de consultation

**Acquisition** :
- D'où viennent les utilisateurs ? (Google, Direct, Social)
- Quels mots-clés génèrent du trafic ?

**Engagement** :
- Pages les plus visitées
- Temps passé sur le site
- Taux de rebond

**Conversion** :
- Taux d'inscription
- Taux de création de devis
- Taux d'abonnement Premium

## 🎯 Objectifs à Configurer

Dans Google Analytics, configurez des **objectifs** (conversions) :

1. **Inscription** :
   - Type : Événement
   - Nom : `sign_up`

2. **Devis créé** :
   - Type : Événement
   - Nom : `generate_lead`

3. **Abonnement Premium** :
   - Type : Événement
   - Nom : `purchase`
   - Valeur : 2.50 EUR

4. **Page Contact** :
   - Type : Destination
   - URL : `/contact`

## 🔍 Vérification du Tracking

### Méthode 1 : Console développeur

1. Ouvrez votre site : `https://reexpresstrack.com`
2. Ouvrez la console (F12)
3. **Acceptez les cookies analytiques** dans le banner
4. Vérifiez les logs :
   ```
   ✅ Google Analytics loaded and initialized
   ```
5. Vérifiez que `window.gtag` existe :
   ```javascript
   console.log(typeof window.gtag); // "function"
   ```

### Méthode 2 : Extension Chrome

1. Installez [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger)
2. Activez l'extension
3. Rechargez votre site
4. Ouvrez la console
5. Vous verrez les événements GA4 envoyés

### Méthode 3 : GA4 DebugView

1. Allez dans Google Analytics
2. Cliquez sur **Configure** → **DebugView**
3. Naviguez sur votre site (avec cookies analytiques acceptés)
4. Les événements apparaissent en temps réel dans DebugView

## ⚠️ Points Importants

### Cookies Analytics

Les cookies Google Analytics créés (si consentement) :

- `_ga` : Identifiant utilisateur unique (2 ans)
- `_ga_*` : État de la session (2 ans)
- `_gid` : Identifiant session (24 heures)

### Anonymisation IP

L'IP des utilisateurs est **anonymisée** automatiquement :
```typescript
gtag('config', 'G-Z698JPXVRL', {
  anonymize_ip: true, // ← Conformité RGPD
});
```

### Conformité RGPD

✅ **Conforme** car :
- Consentement requis avant activation
- IP anonymisée
- Cookies sécurisés
- Possibilité de refuser/retirer le consentement
- Suppression des cookies si refus

## 📱 Tracking Multi-Plateforme

Si vous développez une app mobile plus tard, vous pouvez :

1. Utiliser le **même ID de mesure** (`G-Z698JPXVRL`)
2. Installer Firebase Analytics (iOS/Android)
3. Lier Firebase à GA4
4. Voir tous les utilisateurs (web + mobile) dans le même dashboard

## 🚀 Prochaines Étapes

1. **Vérifiez le tracking** :
   - Testez en acceptant les cookies
   - Naviguez sur plusieurs pages
   - Vérifiez dans GA4 Temps Réel

2. **Configurez les conversions** :
   - Créez des événements personnalisés
   - Définissez les objectifs business

3. **Analysez les données** :
   - Attendez 24-48h pour avoir des données
   - Consultez les rapports quotidiennement
   - Ajustez votre stratégie SEO/marketing

4. **Optimisez** :
   - Identifiez les pages à fort rebond
   - Améliorez les pages avec peu d'engagement
   - Testez A/B différentes versions

## 📞 Support

**Google Analytics Help** : [support.google.com/analytics](https://support.google.com/analytics)

**Documentation GA4** : [developers.google.com/analytics/devguides/collection/ga4](https://developers.google.com/analytics/devguides/collection/ga4)

## ✅ Checklist de Vérification

- [x] Google Analytics configuré
- [x] ID de mesure ajouté (G-Z698JPXVRL)
- [x] Consentement cookies implémenté
- [x] Anonymisation IP activée
- [x] Intégré dans App.tsx
- [ ] Testé en production
- [ ] Conversions configurées dans GA4
- [ ] DebugView vérifié
- [ ] Première semaine de données analysée

---

**Note** : Google Analytics ne se charge QUE si l'utilisateur accepte les cookies analytiques. C'est 100% conforme au RGPD. 🔒
