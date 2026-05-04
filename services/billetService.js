const db = require("../models");
const crypto = require("crypto");

class BilletService {
  async generateCodeBillet() {
    // Générer un code unique
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  async createBillet(billetData) {
    // Validation basique
    if (!billetData.reservation_id || !billetData.utilisateur_id || !billetData.seance_id) {
      throw new Error("Réservation, utilisateur et séance sont requis");
    }

    // Vérifier que la réservation existe et est payée
    const reservation = await db.reservations.findByPk(billetData.reservation_id, {
      include: [{ model: db.seances, as: 'seance' }]
    });

    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    if (reservation.statut !== 'PAYEE') {
      throw new Error("La réservation doit être payée pour générer un billet");
    }

    // Vérifier que l'utilisateur correspond
    if (reservation.utilisateur_id !== billetData.utilisateur_id) {
      throw new Error("L'utilisateur ne correspond pas à la réservation");
    }

    // Générer le code du billet
    const codeBillet = await this.generateCodeBillet();

    const billet = await db.billets.create({
      ...billetData,
      code_billet: codeBillet
    });

    return billet;
  }

  async createBilletsForReservation(reservationId) {
    // Récupérer la réservation avec ses détails
    const reservation = await db.reservations.findByPk(reservationId, {
      include: [
        { model: db.seances, as: 'seance' },
        { model: db.utilisateurs, as: 'utilisateur' }
      ]
    });

    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    if (reservation.statut !== 'PAYEE') {
      throw new Error("La réservation doit être payée");
    }

    // Créer un billet par place réservée
    const billets = [];
    for (let i = 0; i < reservation.nombrePlace; i++) {
      const codeBillet = await this.generateCodeBillet();
      billets.push({
        code_billet: codeBillet,
        reservation_id: reservationId,
        utilisateur_id: reservation.utilisateur_id,
        seance_id: reservation.seance_id
      });
    }

    const createdBillets = await db.billets.bulkCreate(billets);
    return createdBillets;
  }

  async getBilletsByUser(userId) {
    const billets = await db.billets.findAll({
      where: { utilisateur_id: userId },
      include: [
        {
          model: db.reservations,
          as: 'reservation',
          include: [
            { model: db.seances, as: 'seance', include: [{ model: db.films, as: 'film' }, { model: db.salles, as: 'salle' }] }
          ]
        }
      ],
      order: [['date_generation', 'DESC']]
    });

    return billets;
  }

  async getBilletById(id) {
    const billet = await db.billets.findByPk(id, {
      include: [
        {
          model: db.reservations,
          as: 'reservation',
          include: [
            { model: db.seances, as: 'seance', include: [{ model: db.films, as: 'film' }, { model: db.salles, as: 'salle' }] },
            { model: db.utilisateurs, as: 'utilisateur' }
          ]
        }
      ]
    });

    if (!billet) {
      throw new Error("Billet introuvable");
    }

    return billet;
  }

  async getBilletByCode(code) {
    const billet = await db.billets.findOne({
      where: { code_billet: code },
      include: [
        {
          model: db.reservations,
          as: 'reservation',
          include: [
            { model: db.seances, as: 'seance', include: [{ model: db.films, as: 'film' }, { model: db.salles, as: 'salle' }] },
            { model: db.utilisateurs, as: 'utilisateur' }
          ]
        }
      ]
    });

    if (!billet) {
      throw new Error("Billet introuvable");
    }

    return billet;
  }

  async validateBillet(code) {
    const billet = await this.getBilletByCode(code);

    // Vérifier si le billet n'a pas été utilisé (logique à étendre)
    // Pour l'instant, juste vérifier qu'il existe et que la séance n'est pas passée

    const now = new Date();
    const seanceDate = new Date(billet.reservation.seance.dateHeure);

    if (seanceDate < now) {
      throw new Error("Ce billet est pour une séance passée");
    }

    return {
      valide: true,
      billet,
      message: "Billet valide"
    };
  }

  async deleteBillet(id) {
    const billet = await this.getBilletById(id);

    // Vérifier si la séance n'est pas passée
    const now = new Date();
    const seanceDate = new Date(billet.reservation.seance.dateHeure);

    if (seanceDate < now) {
      throw new Error("Impossible de supprimer un billet pour une séance passée");
    }

    await billet.destroy();
    return { message: "Billet supprimé avec succès" };
  }
}

module.exports = new BilletService();