# 🎬 Cinéma - Frontend Simple

## 🚀 Démarrage rapide

1. **Démarrer le serveur backend :**
   ```bash
   cd votre-dossier-projet
   node server.js
   ```

2. **Ouvrir le frontend :**
   - Ouvrez `frontend/index.html` dans votre navigateur
   - Ou utilisez un serveur local (Live Server, etc.)

## 📱 Pages disponibles

### 🏠 Accueil (`index.html`)
- **Tableau de bord** avec statistiques
- **Actions rapides** vers les principales fonctionnalités
- **Films récents** affichés

### 🎭 Films (`films.html`)
- Liste de tous les films disponibles
- Boutons selon le rôle utilisateur :
  - **Client** : Voir séances, détails
  - **Agent/Admin** : Modifier, supprimer

### 🎫 Séances (`seances.html`)
- Liste des séances programmées
- Réservation directe pour les clients

### 💺 Réservation (`reservation-simple.html`)
- **Sélection visuelle des places**
- Grille interactive avec écran
- Confirmation de réservation

### 👤 Profil (`profil.html`)
- Gestion du profil utilisateur
- Historique des réservations

## 🎯 Fonctionnalités par rôle

### 👤 Client
- Voir les films et séances
- Réserver des places spécifiques
- Consulter ses réservations
- Modifier son profil

### 🎩 Agent
- Toutes les permissions client
- Gérer les films et séances
- Accéder aux statistiques

### 👑 Admin
- Toutes les permissions agent
- Gérer les utilisateurs
- Statistiques complètes
- Administration complète

## 🎨 Interface

### Design simple et intuitif
- **Navigation claire** en haut de page
- **Cartes responsives** pour le contenu
- **Boutons colorés** selon l'action
- **Grille de places** visuelle et interactive

### Responsive
- S'adapte aux mobiles et tablettes
- Grille flexible pour tous les écrans

## 🔧 Technologies utilisées

- **HTML5** - Structure des pages
- **CSS3** - Styles modernes et responsives
- **JavaScript ES6** - Logique interactive
- **Fetch API** - Communication avec le backend

## 📊 API Endpoints utilisés

- `GET /api/films` - Liste des films
- `GET /api/seances` - Liste des séances
- `GET /api/places/disponibles/:seance_id` - Places disponibles
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/user` - Réservations utilisateur

## 🎯 Points forts de cette solution

✅ **Très simple** - Interface claire et intuitive
✅ **Fonctionnelle** - Toutes les features essentielles
✅ **Responsive** - Marche sur tous les appareils
✅ **Modulaire** - Facile à étendre
✅ **Performante** - Chargement rapide

## 🚀 Utilisation

1. **Connexion** : `auth.html`
2. **Navigation** : Utilisez la barre du haut
3. **Réservation** : Films → Séances → Places → Confirmer
4. **Gestion** : Selon votre rôle, boutons d'action disponibles

**Prêt à utiliser ! 🎬**