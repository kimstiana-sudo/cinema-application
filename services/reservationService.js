const db = require("../models");
const { Op } = require("sequelize");

class ReservationService {
  async createReservation(reservationData) {
    // Validation basique - maintenant on attend une liste de places
    if (!reservationData.place_ids || !Array.isArray(reservationData.place_ids) || reservationData.place_ids.length === 0) {
      throw new Error("Liste des places requise");
    }

    if (!reservationData.utilisateur_id || !reservationData.seance_id) {
      throw new Error("Utilisateur et séance sont requis");
    }

    // Vérifier que l'utilisateur existe
    const utilisateur = await db.utilisateurs.findByPk(reservationData.utilisateur_id);
    if (!utilisateur) {
      throw new Error("Utilisateur introuvable");
    }

    // Vérifier le nombre maximum de réservations actives
    const reservationsActives = await db.reservations.count({
      where: {
        utilisateur_id: reservationData.utilisateur_id,
        statut: ['CONFIRMEE', 'PAYEE'] // seulement les réservations actives
      }
    });

    if (reservationsActives >= utilisateur.max_reservations) {
      throw new Error(`Vous avez atteint le nombre maximum de réservations autorisées (${utilisateur.max_reservations})`);
    }

    // Vérifier que la séance existe
    const seance = await db.seances.findByPk(reservationData.seance_id, {
      include: [{ model: db.salles, as: 'salle' }]
    });

    if (!seance) {
      throw new Error("Séance introuvable");
    }

    // Vérifier que toutes les places existent et appartiennent à la salle de la séance
    const places = await db.places.findAll({
      where: {
        id: reservationData.place_ids,
        salle_id: seance.salle.id
      }
    });

    if (places.length !== reservationData.place_ids.length) {
      throw new Error("Une ou plusieurs places n'existent pas ou n'appartiennent pas à cette salle");
    }

    // Vérifier que les places ne sont pas déjà réservées pour cette séance
    const reservationsExistantes = await db.reservations.findAll({
      where: { seance_id: reservationData.seance_id },
      include: [{
        model: db.places,
        as: 'places',
        where: { id: reservationData.place_ids },
        required: false
      }]
    });

    const placesDejaReservees = [];
    reservationsExistantes.forEach(reservation => {
      if (reservation.places && reservation.places.length > 0) {
        placesDejaReservees.push(...reservation.places.map(p => p.id));
      }
    });

    if (placesDejaReservees.length > 0) {
      throw new Error(`Les places suivantes sont déjà réservées: ${placesDejaReservees.join(', ')}`);
    }

    // Créer la réservation
    const reservation = await db.reservations.create({
      utilisateur_id: reservationData.utilisateur_id,
      seance_id: reservationData.seance_id,
      nombrePlace: reservationData.place_ids.length, // Garder pour compatibilité
      statut: 'CONFIRMEE'
    });

    // Associer les places à la réservation
    await reservation.setPlaces(reservationData.place_ids);

    return reservation;
  }

  async getReservationsByUser(userId) {
    const reservations = await db.reservations.findAll({
      where: { utilisateur_id: userId },
      include: [
        {
          model: db.seances,
          as: 'seance',
          include: [
            { model: db.films, as: 'film' },
            { model: db.salles, as: 'salle' }
          ]
        },
        {
          model: db.places,
          as: 'places'
        }
      ],
      order: [['id', 'DESC']]
    });

    return reservations;
  }

  async getAllReservations() {
    const reservations = await db.reservations.findAll({
      include: [
        {
          model: db.utilisateurs,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: db.seances,
          as: 'seance',
          include: [
            { model: db.films, as: 'film' },
            { model: db.salles, as: 'salle' }
          ]
        },
        {
          model: db.places,
          as: 'places'
        }
      ],
      order: [['id', 'DESC']]
    });

    return reservations;
  }

  async getReservationById(id) {
    const reservation = await db.reservations.findByPk(id, {
      include: [
        {
          model: db.utilisateurs,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: db.seances,
          as: 'seance',
          include: [
            { model: db.films, as: 'film' },
            { model: db.salles, as: 'salle' }
          ]
        },
        {
          model: db.places,
          as: 'places'
        }
      ]
    });

    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    return reservation;
  }

  async cancelReservation(id, userId) {
    const reservation = await this.getReservationById(id);

    // Vérifier que la réservation appartient à l'utilisateur
    if (reservation.utilisateur_id !== userId) {
      throw new Error("Vous ne pouvez annuler que vos propres réservations");
    }

    // Vérifier le statut (seulement si confirmée)
    if (reservation.statut !== 'CONFIRMEE') {
      throw new Error("Cette réservation ne peut pas être annulée");
    }

    // Vérifier le délai (ex: pas moins de 2h avant la séance)
    const now = new Date();
    const seanceDate = new Date(reservation.seance.dateHeure);
    const diffHeures = (seanceDate - now) / (1000 * 60 * 60);

    if (diffHeures < 2) {
      throw new Error("Annulation impossible moins de 2h avant la séance");
    }

    // Annuler la réservation
    await reservation.update({ statut: 'ANNULEE' });

    return reservation;
  }

  async updateReservationStatus(id, newStatus) {
    const reservation = await this.getReservationById(id);

    const statutsValides = ['CONFIRMEE', 'ANNULEE', 'PAYEE'];
    if (!statutsValides.includes(newStatus)) {
      throw new Error("Statut invalide");
    }

    await reservation.update({ statut: newStatus });
    return reservation;
  }

  async modifyReservation(id, userId, newPlaceIds) {
    console.log('modifyReservation called with:', { id, userId, newPlaceIds });
    
    const reservation = await this.getReservationById(id);

    // Vérifier que la réservation appartient à l'utilisateur
    if (reservation.utilisateur_id !== userId) {
      throw new Error("Vous ne pouvez modifier que vos propres réservations");
    }

    // Vérifier que la réservation n'est pas payée
    if (reservation.statut === 'PAYEE') {
      throw new Error("Impossible de modifier une réservation payée");
    }

    // Vérifier que la séance n'est pas passée
    const now = new Date();
    const seanceDate = new Date(reservation.seance.dateHeure);
    if (seanceDate <= now) {
      throw new Error("Impossible de modifier une réservation pour une séance passée");
    }

    // Vérifier les nouvelles places
    if (!newPlaceIds || !Array.isArray(newPlaceIds) || newPlaceIds.length === 0) {
      throw new Error("Liste des places requise");
    }

    // Vérifier que toutes les places existent et appartiennent à la salle de la séance
    const places = await db.places.findAll({
      where: {
        id: newPlaceIds,
        salle_id: reservation.seance.salle.id
      }
    });

    if (places.length !== newPlaceIds.length) {
      throw new Error("Une ou plusieurs places n'existent pas ou n'appartiennent pas à cette salle");
    }

    // Vérifier que les nouvelles places ne sont pas déjà réservées pour cette séance
    const reservationsExistantes = await db.reservations.findAll({
      where: { 
        seance_id: reservation.seance_id,
        id: { [Op.ne]: id } // exclure cette réservation
      },
      include: [{
        model: db.places,
        as: 'places',
        where: { id: newPlaceIds },
        required: false
      }]
    });

    const placesDejaReservees = [];
    reservationsExistantes.forEach(res => {
      if (res.places && res.places.length > 0) {
        placesDejaReservees.push(...res.places.map(p => p.id));
      }
    });

    if (placesDejaReservees.length > 0) {
      throw new Error(`Les places suivantes sont déjà réservées: ${placesDejaReservees.join(', ')}`);
    }

    // Mettre à jour les places
    await reservation.setPlaces(newPlaceIds);
    await reservation.update({ nombrePlace: newPlaceIds.length });

    return reservation;
  }

  async deleteReservation(id, userId) {
    const reservation = await this.getReservationById(id);

    // Vérifier que la réservation appartient à l'utilisateur
    if (reservation.utilisateur_id !== userId) {
      throw new Error("Vous ne pouvez supprimer que vos propres réservations");
    }

    // Vérifier que la réservation n'est pas payée
    if (reservation.statut === 'PAYEE') {
      throw new Error("Impossible de supprimer une réservation payée");
    }

    // Supprimer la réservation
    await reservation.destroy();

    return { message: "Réservation supprimée avec succès" };
  }

  async getReservationsBySeance(seanceId) {
    const reservations = await db.reservations.findAll({
      where: { seance_id: seanceId },
      include: [
        {
          model: db.utilisateurs,
          as: 'utilisateur',
          attributes: ['id', 'nom', 'prenom', 'email']
        },
        {
          model: db.places,
          as: 'places'
        }
      ],
      order: [['id', 'ASC']]
    });

    return reservations;
  }

  async getReservationStatistics() {
    // Statistiques générales
    const totalReservations = await db.reservations.count();
    const reservationsConfirmees = await db.reservations.count({ where: { statut: 'CONFIRMEE' } });
    const reservationsAnnulees = await db.reservations.count({ where: { statut: 'ANNULEE' } });
    const reservationsPayees = await db.reservations.count({ where: { statut: 'PAYEE' } });

    // Total des places réservées
    const totalPlacesReservees = await db.reservations.sum('nombrePlace') || 0;

    // Statistiques par film (films les plus populaires)
    const statsParFilm = await db.sequelize.query(`
      SELECT f.titre, COUNT(r.id) as nombre_reservations, SUM(r.nombrePlace) as total_places
      FROM reservations r
      JOIN seances s ON r.seance_id = s.id
      JOIN films f ON s.film_id = f.id
      WHERE r.statut IN ('CONFIRMEE', 'PAYEE')
      GROUP BY f.id, f.titre
      ORDER BY nombre_reservations DESC
      LIMIT 10
    `, { type: db.sequelize.QueryTypes.SELECT });

    // Statistiques par salle
    const statsParSalle = await db.sequelize.query(`
      SELECT sa.nom, COUNT(r.id) as nombre_reservations, SUM(r.nombrePlace) as total_places
      FROM reservations r
      JOIN seances s ON r.seance_id = s.id
      JOIN salles sa ON s.salle_id = sa.id
      WHERE r.statut IN ('CONFIRMEE', 'PAYEE')
      GROUP BY sa.id, sa.nom
      ORDER BY nombre_reservations DESC
    `, { type: db.sequelize.QueryTypes.SELECT });

    // Revenus estimés (basé sur un prix fixe de 10€ par place)
    const prixParPlace = 10;
    const revenusEstimes = totalPlacesReservees * prixParPlace;

    return {
      generales: {
        total_reservations: totalReservations,
        reservations_confirmees: reservationsConfirmees,
        reservations_annulees: reservationsAnnulees,
        reservations_payees: reservationsPayees,
        total_places_reservees: totalPlacesReservees,
        revenus_estimés: revenusEstimes
      },
      par_film: statsParFilm,
      par_salle: statsParSalle
    };
  }
}

module.exports = new ReservationService();