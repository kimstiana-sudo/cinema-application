# Pages Frontend pour les Opérations Utilisateur

Ce document décrit les nouvelles pages HTML créées pour améliorer l'expérience utilisateur lors des opérations de paiement, modification et suppression de réservations.

## Pages créées

### 1. `paiement.html` - Simulation de paiement
- **URL**: `paiement.html?reservationId={id}`
- **Fonctionnalités**:
  - Affichage des détails de la réservation (film, salle, date, places, montant)
  - Formulaire de saisie du numéro de carte (18 chiffres exactement)
  - Validation côté client du numéro de carte
  - Simulation de paiement avec appel à l'API `/api/paiements`
  - Redirection vers la liste des réservations après paiement réussi

### 2. `modifier-reservation.html` - Modification de réservation
- **URL**: `modifier-reservation.html?reservationId={id}`
- **Fonctionnalités**:
  - Affichage des détails actuels de la réservation
  - Grille interactive des places de la salle
  - Sélection visuelle des nouvelles places
  - Légende des statuts (disponible, réservé, sélectionné)
  - Validation que l'utilisateur sélectionne au moins une place
  - Appel à l'API `/api/reservations/{id}/modify` avec les nouvelles places

### 3. `supprimer-reservation.html` - Suppression de réservation
- **URL**: `supprimer-reservation.html?reservationId={id}`
- **Fonctionnalités**:
  - Avertissement visuel sur l'action irréversible
  - Affichage des détails de la réservation à supprimer
  - Champ de confirmation textuel ("SUPPRIMER")
  - Double confirmation (champ texte + popup de confirmation)
  - Appel à l'API `/api/reservations/{id}` avec DELETE

## Modifications apportées

### `reservation.js`
- Les fonctions `payer()`, `modifier()`, et `supprimer()` ont été simplifiées
- Elles redirigent maintenant vers les pages dédiées au lieu d'utiliser des prompts/alertes
- Amélioration de l'expérience utilisateur

### `routes/authRoutes.js`
- Ajout d'un alias `/auth/login` pour la route de connexion (compatibilité)

## Utilisation

1. **Paiement**:
   - Depuis la page des réservations, cliquer sur "Payer"
   - Remplir le numéro de carte (18 chiffres)
   - Confirmer le paiement

2. **Modification**:
   - Depuis la page des réservations, cliquer sur "Modifier"
   - Sélectionner les nouvelles places dans la grille
   - Confirmer la modification

3. **Suppression**:
   - Depuis la page des réservations, cliquer sur "Supprimer"
   - Taper "SUPPRIMER" dans le champ de confirmation
   - Confirmer dans la popup

## Sécurité

- Vérification de l'authentification utilisateur sur chaque page
- Validation que la réservation appartient à l'utilisateur connecté
- Vérification du statut des réservations (pas de modification/suppression de réservations payées)
- Validation côté client et serveur des données

## API Endpoints utilisés

- `GET /api/reservations/{id}` - Détails d'une réservation
- `POST /api/paiements` - Traitement du paiement
- `PUT /api/reservations/{id}/modify` - Modification de réservation
- `DELETE /api/reservations/{id}` - Suppression de réservation
- `GET /api/places/salle/{salle_id}` - Places d'une salle

## Styles

Toutes les pages utilisent le fichier `style.css` existant et ajoutent des styles spécifiques pour :
- Grille de places interactive
- Cartes d'avertissement
- Formulaires de confirmation
- Boutons d'action stylisés