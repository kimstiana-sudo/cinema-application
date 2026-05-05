const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Plateforme de Réservation de Billets de Cinéma',
      version: '1.0.0',
      description: 'Documentation complète de l\'API REST pour la plateforme de réservation de billets de cinéma. Projet de session - Collège Universel.',
      contact: { name: 'Équipe Cinéma' }
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Serveur local' },
      { url: 'https://cinema-app.onrender.com/api', description: 'Serveur de production' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via POST /connexion'
        }
      },
      schemas: {
        // ── AUTH ──────────────────────────────────────────────
        RegisterInput: {
          type: 'object', required: ['nom','prenom','email','password'],
          properties: {
            nom:      { type: 'string', example: 'Dupont' },
            prenom:   { type: 'string', example: 'Jean' },
            email:    { type: 'string', format: 'email', example: 'jean@email.com' },
            password: { type: 'string', minLength: 6, example: 'motdepasse123' }
          }
        },
        LoginInput: {
          type: 'object', required: ['email','password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'jean@email.com' },
            password: { type: 'string', example: 'motdepasse123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Connexion réussie' },
            token:   { type: 'string', example: 'eyJhbGci...' },
            user: {
              type: 'object',
              properties: {
                id:     { type: 'integer', example: 1 },
                nom:    { type: 'string', example: 'Dupont' },
                prenom: { type: 'string', example: 'Jean' },
                email:  { type: 'string', example: 'jean@email.com' },
                role:   { type: 'object', properties: { id: { type: 'integer' }, nom: { type: 'string', example: 'client' } } }
              }
            }
          }
        },
        // ── FILM ──────────────────────────────────────────────
        Film: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            titre:          { type: 'string', example: 'Inception' },
            description:    { type: 'string', example: 'Un voleur qui s\'infiltre dans les rêves.' },
            genre:          { type: 'string', example: 'Science-fiction' },
            duree_min:      { type: 'integer', example: 148 },
            classification: { type: 'string', example: 'Tous publics' },
            categorie_id:   { type: 'integer', example: 1 },
            categorie:      { $ref: '#/components/schemas/Categorie' }
          }
        },
        FilmInput: {
          type: 'object', required: ['titre','duree_min'],
          properties: {
            titre:          { type: 'string', example: 'Inception' },
            description:    { type: 'string', example: 'Synopsis du film' },
            genre:          { type: 'string', example: 'Science-fiction' },
            duree_min:      { type: 'integer', example: 148 },
            classification: { type: 'string', enum: ['Tous publics','Déconseillé -10','Déconseillé -13','Déconseillé -16','Interdit -18'], example: 'Tous publics' },
            categorie_id:   { type: 'integer', example: 1 }
          }
        },
        // ── CATEGORIE ─────────────────────────────────────────
        Categorie: {
          type: 'object',
          properties: {
            id:  { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Action' }
          }
        },
        // ── SALLE ─────────────────────────────────────────────
        Salle: {
          type: 'object',
          properties: {
            id:       { type: 'integer', example: 1 },
            nom:      { type: 'string', example: 'Salle 1' },
            capacite: { type: 'integer', example: 100 },
            type:     { type: 'string', example: 'standard' }
          }
        },
        SalleInput: {
          type: 'object', required: ['nom','capacite'],
          properties: {
            nom:      { type: 'string', example: 'Salle 1' },
            capacite: { type: 'integer', minimum: 10, example: 100 }
          }
        },
        // ── SEANCE ────────────────────────────────────────────
        Seance: {
          type: 'object',
          properties: {
            id:                 { type: 'integer', example: 1 },
            film_id:            { type: 'integer', example: 1 },
            salle_id:           { type: 'integer', example: 1 },
            dateHeure:          { type: 'string', format: 'date-time', example: '2025-06-15T20:00:00Z' },
            prix:               { type: 'number', example: 12.50 },
            placesDisponibles:  { type: 'integer', example: 85 },
            film:               { $ref: '#/components/schemas/Film' },
            salle:              { $ref: '#/components/schemas/Salle' }
          }
        },
        SeanceInput: {
          type: 'object', required: ['film_id','salle_id','dateHeure','prix'],
          properties: {
            film_id:   { type: 'integer', example: 1 },
            salle_id:  { type: 'integer', example: 1 },
            dateHeure: { type: 'string', format: 'date-time', example: '2025-06-15T20:00:00Z' },
            prix:      { type: 'number', minimum: 0, example: 12.50 }
          }
        },
        // ── RESERVATION ───────────────────────────────────────
        Reservation: {
          type: 'object',
          properties: {
            id:               { type: 'integer', example: 1 },
            utilisateur_id:   { type: 'integer', example: 1 },
            seance_id:        { type: 'integer', example: 1 },
            statut:           { type: 'string', enum: ['CONFIRMEE','PAYEE','ANNULEE'], example: 'CONFIRMEE' },
            date_reservation: { type: 'string', format: 'date-time' },
            nombrePlace:      { type: 'integer', example: 2 },
            seance:           { $ref: '#/components/schemas/Seance' },
            utilisateur:      { $ref: '#/components/schemas/Utilisateur' },
            places:           { type: 'array', items: { $ref: '#/components/schemas/Place' } }
          }
        },
        ReservationInput: {
          type: 'object', required: ['seance_id','place_ids'],
          properties: {
            seance_id:  { type: 'integer', example: 1 },
            place_ids:  { type: 'array', items: { type: 'integer' }, example: [12, 13] }
          }
        },
        // ── PLACE ─────────────────────────────────────────────
        Place: {
          type: 'object',
          properties: {
            id:          { type: 'integer', example: 1 },
            salle_id:    { type: 'integer', example: 1 },
            rang:        { type: 'string', example: 'A' },
            numero:      { type: 'integer', example: 5 },
            disponible:  { type: 'boolean', example: true }
          }
        },
        // ── PAIEMENT ──────────────────────────────────────────
        Paiement: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            reservation_id: { type: 'integer', example: 1 },
            utilisateur_id: { type: 'integer', example: 1 },
            montant:        { type: 'number', example: 25.00 },
            statut:         { type: 'string', enum: ['en_attente','paye','annule','rembourse'], example: 'paye' },
            methode:        { type: 'string', example: 'carte' },
            date_paiement:  { type: 'string', format: 'date-time' }
          }
        },
        PaiementInput: {
          type: 'object', required: ['reservationId','numeroCarte'],
          properties: {
            reservationId: { type: 'integer', example: 1 },
            numeroCarte:   { type: 'string', minLength: 18, maxLength: 18, example: '123456789012345678' }
          }
        },
        // ── BILLET ────────────────────────────────────────────
        Billet: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            reservation_id: { type: 'integer', example: 1 },
            utilisateur_id: { type: 'integer', example: 1 },
            code_billet:    { type: 'string', example: 'BIL-2025-ABC123' },
            reservation:    { $ref: '#/components/schemas/Reservation' }
          }
        },
        // ── UTILISATEUR ───────────────────────────────────────
        Utilisateur: {
          type: 'object',
          properties: {
            id:               { type: 'integer', example: 1 },
            nom:              { type: 'string', example: 'Dupont' },
            prenom:           { type: 'string', example: 'Jean' },
            email:            { type: 'string', example: 'jean@email.com' },
            roleId:           { type: 'integer', example: 1 },
            max_reservations: { type: 'integer', example: 3 },
            role:             { type: 'object', properties: { id: { type: 'integer' }, nom: { type: 'string' } } }
          }
        },
        // ── ERREUR ────────────────────────────────────────────
        Erreur: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Message d\'erreur' }
          }
        }
      }
    },

    paths: {
      // ════════════════════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════════════════════
      '/register': {
        post: {
          tags: ['Authentification'],
          summary: 'Créer un nouveau compte client',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
          responses: {
            201: { description: 'Compte créé avec succès', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, user: { $ref: '#/components/schemas/Utilisateur' } } } } } },
            400: { description: 'Email déjà utilisé ou données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erreur' } } } }
          }
        }
      },
      '/connexion': {
        post: {
          tags: ['Authentification'],
          summary: 'Se connecter et obtenir un token JWT',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
          responses: {
            200: { description: 'Connexion réussie', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Identifiants incorrects', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erreur' } } } }
          }
        }
      },
      '/profile/{id}': {
        get: {
          tags: ['Authentification'],
          summary: 'Obtenir le profil d\'un utilisateur',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Profil retourné', content: { 'application/json': { schema: { $ref: '#/components/schemas/Utilisateur' } } } },
            401: { description: 'Token manquant ou invalide' },
            403: { description: 'Accès refusé' },
            404: { description: 'Utilisateur introuvable' }
          }
        },
        put: {
          tags: ['Authentification'],
          summary: 'Modifier son profil',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nom: { type: 'string' }, prenom: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, max_reservations: { type: 'integer' } } } } } },
          responses: {
            200: { description: 'Profil mis à jour' },
            401: { description: 'Token manquant' },
            403: { description: 'Accès refusé' }
          }
        }
      },

      // ════════════════════════════════════════════════════════
      // FILMS
      // ════════════════════════════════════════════════════════
      '/films': {
        get: {
          tags: ['Films'],
          summary: 'Obtenir la liste de tous les films',
          responses: {
            200: { description: 'Liste des films', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Film' } } } } }
          }
        },
        post: {
          tags: ['Films'],
          summary: 'Ajouter un film (agent/admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FilmInput' } } } },
          responses: {
            201: { description: 'Film ajouté', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, film: { $ref: '#/components/schemas/Film' } } } } } },
            400: { description: 'Données invalides' },
            401: { description: 'Token manquant' },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },
      '/films/{id}': {
        get: {
          tags: ['Films'],
          summary: 'Obtenir un film par son ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Film trouvé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Film' } } } },
            404: { description: 'Film introuvable' }
          }
        },
        put: {
          tags: ['Films'],
          summary: 'Modifier un film (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/FilmInput' } } } },
          responses: {
            200: { description: 'Film modifié' },
            401: { description: 'Token manquant' },
            403: { description: 'Rôle insuffisant' },
            404: { description: 'Film introuvable' }
          }
        },
        delete: {
          tags: ['Films'],
          summary: 'Supprimer un film (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Film supprimé' },
            400: { description: 'Film lié à des séances' },
            401: { description: 'Token manquant' },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },

      // ════════════════════════════════════════════════════════
      // SALLES
      // ════════════════════════════════════════════════════════
      '/salles': {
        get: {
          tags: ['Salles'],
          summary: 'Obtenir la liste des salles',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Liste des salles', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Salle' } } } } }
          }
        },
        post: {
          tags: ['Salles'],
          summary: 'Créer une salle (agent/admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalleInput' } } } },
          responses: {
            201: { description: 'Salle créée' },
            400: { description: 'Nom déjà existant ou données invalides' },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },
      '/salles/{id}': {
        get: {
          tags: ['Salles'],
          summary: 'Obtenir une salle par son ID (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Salle trouvée' }, 404: { description: 'Salle introuvable' } }
        },
        put: {
          tags: ['Salles'],
          summary: 'Modifier une salle (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SalleInput' } } } },
          responses: { 200: { description: 'Salle modifiée' }, 403: { description: 'Rôle insuffisant' } }
        },
        delete: {
          tags: ['Salles'],
          summary: 'Supprimer une salle (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Salle supprimée' }, 400: { description: 'Salle liée à des séances' } }
        }
      },

      // ════════════════════════════════════════════════════════
      // SEANCES
      // ════════════════════════════════════════════════════════
      '/seances': {
        get: {
          tags: ['Séances'],
          summary: 'Obtenir toutes les séances',
          parameters: [{ name: 'film_id', in: 'query', schema: { type: 'integer' }, description: 'Filtrer par film' }],
          responses: {
            200: { description: 'Liste des séances', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Seance' } } } } }
          }
        },
        post: {
          tags: ['Séances'],
          summary: 'Créer une séance (agent/admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SeanceInput' } } } },
          responses: {
            201: { description: 'Séance créée' },
            400: { description: 'Conflit horaire ou données invalides' },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },
      '/seances/{id}': {
        get: {
          tags: ['Séances'],
          summary: 'Obtenir une séance par ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Séance trouvée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Seance' } } } }, 404: { description: 'Séance introuvable' } }
        },
        put: {
          tags: ['Séances'],
          summary: 'Modifier une séance (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SeanceInput' } } } },
          responses: { 200: { description: 'Séance modifiée' }, 403: { description: 'Rôle insuffisant' } }
        },
        delete: {
          tags: ['Séances'],
          summary: 'Supprimer une séance (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Séance supprimée' }, 403: { description: 'Rôle insuffisant' } }
        }
      },
      '/seances/{id}/places': {
        get: {
          tags: ['Séances'],
          summary: 'Obtenir les places disponibles pour une séance',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Liste des places', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Place' } } } } } }
        }
      },

      // ════════════════════════════════════════════════════════
      // RESERVATIONS
      // ════════════════════════════════════════════════════════
      '/reservations': {
        post: {
          tags: ['Réservations'],
          summary: 'Créer une réservation',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReservationInput' } } } },
          responses: {
            201: { description: 'Réservation créée', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, reservation: { $ref: '#/components/schemas/Reservation' } } } } } },
            400: { description: 'Places non disponibles ou limite atteinte' },
            401: { description: 'Token manquant' }
          }
        },
        get: {
          tags: ['Réservations'],
          summary: 'Obtenir toutes les réservations (agent/admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Liste de toutes les réservations', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Reservation' } } } } },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },
      '/reservations/user': {
        get: {
          tags: ['Réservations'],
          summary: 'Obtenir les réservations de l\'utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Réservations de l\'utilisateur', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Reservation' } } } } },
            401: { description: 'Token manquant' }
          }
        }
      },
      '/reservations/{id}': {
        get: {
          tags: ['Réservations'],
          summary: 'Obtenir une réservation par ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Réservation trouvée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Reservation' } } } }, 404: { description: 'Réservation introuvable' } }
        },
        delete: {
          tags: ['Réservations'],
          summary: 'Annuler une réservation',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Réservation annulée' }, 400: { description: 'Impossible d\'annuler' }, 401: { description: 'Token manquant' } }
        }
      },
      '/reservations/{id}/statut': {
        put: {
          tags: ['Réservations'],
          summary: 'Changer le statut d\'une réservation (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['statut'], properties: { statut: { type: 'string', enum: ['CONFIRMEE','PAYEE','ANNULEE'] } } } } } },
          responses: { 200: { description: 'Statut mis à jour' }, 403: { description: 'Rôle insuffisant' } }
        }
      },

      // ════════════════════════════════════════════════════════
      // PAIEMENTS
      // ════════════════════════════════════════════════════════
      '/paiements': {
        post: {
          tags: ['Paiements'],
          summary: 'Effectuer un paiement pour une réservation',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaiementInput' } } } },
          responses: {
            200: { description: 'Paiement traité (succès ou refus)', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, paiement: { $ref: '#/components/schemas/Paiement' }, billet: { $ref: '#/components/schemas/Billet' } } } } } },
            400: { description: 'Numéro de carte invalide ou réservation déjà payée' },
            401: { description: 'Token manquant' }
          }
        }
      },
      '/paiements/user': {
        get: {
          tags: ['Paiements'],
          summary: 'Obtenir les paiements de l\'utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Liste des paiements de l\'utilisateur', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Paiement' } } } } } }
        }
      },
      '/paiements/stats': {
        get: {
          tags: ['Paiements'],
          summary: 'Obtenir les statistiques de paiements (agent/admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Statistiques des paiements' }, 403: { description: 'Rôle insuffisant' } }
        }
      },

      // ════════════════════════════════════════════════════════
      // BILLETS
      // ════════════════════════════════════════════════════════
      '/billets/user': {
        get: {
          tags: ['Billets'],
          summary: 'Obtenir les billets de l\'utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Liste des billets', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Billet' } } } } },
            401: { description: 'Token manquant' }
          }
        }
      },
      '/billets/validate': {
        post: {
          tags: ['Billets'],
          summary: 'Valider un billet via son code',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['code_billet'], properties: { code_billet: { type: 'string', example: 'BIL-2025-ABC123' } } } } } },
          responses: { 200: { description: 'Billet valide' }, 404: { description: 'Billet introuvable' } }
        }
      },
      '/billets/code/{code}': {
        get: {
          tags: ['Billets'],
          summary: 'Obtenir un billet par son code (agent/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Billet trouvé' }, 404: { description: 'Billet introuvable' } }
        }
      },

      // ════════════════════════════════════════════════════════
      // UTILISATEURS
      // ════════════════════════════════════════════════════════
      '/users': {
        get: {
          tags: ['Utilisateurs'],
          summary: 'Obtenir tous les utilisateurs (admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Liste des utilisateurs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Utilisateur' } } } } },
            403: { description: 'Rôle insuffisant' }
          }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Utilisateurs'],
          summary: 'Obtenir un utilisateur par ID (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Utilisateur trouvé' }, 404: { description: 'Introuvable' } }
        },
        put: {
          tags: ['Utilisateurs'],
          summary: 'Modifier un utilisateur (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nom: { type: 'string' }, prenom: { type: 'string' }, email: { type: 'string' }, roleId: { type: 'integer' }, max_reservations: { type: 'integer' } } } } } },
          responses: { 200: { description: 'Utilisateur modifié' }, 403: { description: 'Rôle insuffisant' } }
        },
        delete: {
          tags: ['Utilisateurs'],
          summary: 'Supprimer un utilisateur (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Utilisateur supprimé' }, 400: { description: 'Impossible de supprimer' } }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);
module.exports = specs;
