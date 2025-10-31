# Sécurité du Système de Suivi de Colis

## 🔒 Restrictions d'Accès

### Pour les Clients (Utilisateurs normaux)

#### Ce qu'un client PEUT faire :
- ✅ Voir UNIQUEMENT ses propres colis (via `/packages`)
- ✅ Voir les événements de suivi de SES colis (via `/packages/:id/tracking`)
- ✅ Synchroniser le suivi de SES colis avec 17Track (via `/packages/:id/tracking/sync`)

#### Ce qu'un client NE PEUT PAS faire :
- ❌ **Ajouter ou modifier un numéro de suivi** - SEUL L'ADMIN peut le faire
- ❌ Voir les colis d'autres utilisateurs
- ❌ Voir les événements de suivi des colis d'autres utilisateurs
- ❌ Ajouter des numéros de suivi qui ne lui appartiennent pas

### Pour les Administrateurs

#### Ce qu'un admin PEUT faire :
- ✅ Voir tous les colis de tous les utilisateurs
- ✅ **Ajouter et modifier des numéros de suivi pour TOUT colis**
- ✅ Synchroniser le suivi de n'importe quel colis
- ✅ Gérer le statut des colis
- ✅ Uploader des photos pour les colis

## 🛡️ Implémentation de la Sécurité

### Backend (Routes)

#### Route : `POST /packages/:packageId/tracking`
**Restriction** : ADMIN uniquement
```typescript
preHandler: [
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), // ✅ Seuls admins
  validateParams(packageIdParamSchema),
  validateBody(updateTrackingSchema)
]
```

#### Route : `GET /packages/:packageId/tracking`
**Restriction** : Propriétaire du colis uniquement
```typescript
preHandler: [authenticate]
// Le service vérifie que userId correspond au propriétaire
```

#### Route : `POST /packages/:packageId/tracking/sync`
**Restriction** : Propriétaire du colis uniquement
```typescript
preHandler: [authenticate]
// Le service vérifie que userId correspond au propriétaire
```

### Backend (Service)

#### Méthode : `updateTracking(userId, packageId, data)`
```typescript
// Vérifie que le package appartient bien au userId
const pkg = await prisma.package.findFirst({
  where: {
    id: packageId,
    userId, // ✅ Vérification du propriétaire
  },
});
```

#### Méthode : `getTracking(userId, packageId)`
```typescript
// Vérifie que le package appartient bien au userId
const pkg = await prisma.package.findFirst({
  where: {
    id: packageId,
    userId, // ✅ Vérification du propriétaire
  },
});
```

#### Méthode : `getPackageById(packageId)` - ADMIN ONLY
```typescript
// Aucune vérification userId - utilisé uniquement par les routes admin
// Cette méthode n'est appelée que par des routes protégées par requireRole
```

### Frontend

#### TrackingPage (Client)
```typescript
// Récupère UNIQUEMENT les packages du client connecté
const response = await api.get('/packages', {
  params: { limit: 100 }
})
// Filtre uniquement ceux avec trackingNumber
.filter((pkg) => pkg.trackingNumber)
```

#### AdminPackageDetailPage (Admin)
```typescript
// Utilise la route admin-only pour ajouter un trackingNumber
await api.post(`/packages/${id}/tracking`, {
  trackingNumber: trackingNum,
})
```

## 🎯 Flux de Travail Sécurisé

### Ajout d'un Numéro de Suivi

1. **Admin accède** à `/admin/packages/:id`
2. **Admin saisit** un numéro de suivi dans le formulaire
3. **Admin clique** sur "Enregistrer et synchroniser"
4. **Backend vérifie** que l'utilisateur est ADMIN (via `requireRole`)
5. **Backend enregistre** le trackingNumber dans le package
6. **Backend envoie** le tracking à 17Track API
7. **Client peut maintenant** voir ce colis dans `/tracking`

### Consultation du Suivi

1. **Client accède** à `/tracking`
2. **Frontend récupère** les packages via API
3. **Backend vérifie** que l'utilisateur est authentifié
4. **Backend retourne** UNIQUEMENT les packages du client
5. **Frontend affiche** seulement les colis avec trackingNumber
6. **Client clique** sur "Actualiser"
7. **Backend synchronise** avec 17Track (vérification userId)

## ⚠️ Scénarios de Sécurité Testés

### Scénario 1 : Client essaie d'ajouter un tracking à son colis
❌ **BLOQUÉ** : Route protégée par `requireRole(ADMIN)`
```
POST /packages/123/tracking
Authorization: Bearer <client-token>

Réponse : 403 Forbidden - Insufficient permissions
```

### Scénario 2 : Client essaie de voir un colis d'un autre utilisateur
❌ **BLOQUÉ** : Service vérifie userId
```
GET /packages/456/tracking
Authorization: Bearer <client-token>

Réponse : 404 Not Found - Package not found
```

### Scénario 3 : Admin ajoute un tracking à n'importe quel colis
✅ **AUTORISÉ** : Admin a les permissions nécessaires
```
POST /packages/789/tracking
Authorization: Bearer <admin-token>
Body: { trackingNumber: "LX123456789FR" }

Réponse : 200 OK
```

### Scénario 4 : Client voit ses propres colis avec tracking
✅ **AUTORISÉ** : Vérifié par userId dans le service
```
GET /packages?limit=100
Authorization: Bearer <client-token>

Réponse : 200 OK - Seulement les colis du client
```

## 📝 Logs d'Audit

Tous les ajouts/modifications de trackingNumber sont enregistrés dans la table `audit_logs` :
```typescript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'TRACKING_UPDATED',
    resourceType: 'PACKAGE',
    resourceId: packageId,
    metadata: { trackingNumber },
  },
});
```

## ✅ Conformité

- ✅ Un client ne peut accéder qu'à SES données
- ✅ Un client ne peut PAS ajouter de trackingNumber
- ✅ Seul l'admin peut assigner des trackingNumbers
- ✅ Tous les accès sont authentifiés (JWT)
- ✅ Tous les accès sont journalisés
- ✅ Les permissions sont vérifiées à plusieurs niveaux (routes + service)

---

**Date de dernière mise à jour** : 31 Octobre 2025
**Version** : 1.0.0
