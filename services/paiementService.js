const db = require("../models");

class PaiementService {
  async createPaiement(paiementData) {
    // Validation basique
    if (!paiementData.montant || !paiementData.methode || !paiementData.reservation_id || !paiementData.utilisateur_id) {
      throw new Error("Montant, méthode, réservation et utilisateur sont requis");
    }

    if (paiementData.montant <= 0) {
      throw new Error("Le montant doit être positif");
    }

    // Validation de la carte pour méthode "carte"
    if (paiementData.methode === 'carte') {
      if (!paiementData.card_number) {
        throw new Error("Numéro de carte requis pour le paiement par carte");
      }
      if (!/^\d{18}$/.test(paiementData.card_number)) {
        throw new Error("Le numéro de carte doit contenir exactement 18 chiffres");
      }
    }

    // Vérifier que la réservation existe
    const reservation = await db.reservations.findByPk(paiementData.reservation_id);
    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    // Vérifier que l'utilisateur correspond
    if (reservation.utilisateur_id !== paiementData.utilisateur_id) {
      throw new Error("L'utilisateur ne correspond pas à la réservation");
    }

    // Vérifier que la réservation n'est pas déjà payée
    if (reservation.statut === 'PAYEE') {
      throw new Error("Cette réservation est déjà payée");
    }

    // Simulation de paiement
    const statutFinal = await this.simulerPaiement(paiementData.methode);

    const paiement = await db.paiements.create({
      montant: paiementData.montant,
      methode: paiementData.methode,
      statut: statutFinal,
      date_paiement: statutFinal === 'paye' ? new Date() : null,
      reservation_id: paiementData.reservation_id,
      utilisateur_id: paiementData.utilisateur_id
    });

    // Si paiement réussi, mettre à jour le statut de la réservation et créer le billet
    if (statutFinal === 'paye') {
      await reservation.update({ statut: 'PAYEE' });
      
      // Créer le billet
      const codeBillet = this.generateCodeBillet();
      await db.billets.create({
        code_billet: codeBillet,
        reservation_id: paiementData.reservation_id,
        utilisateur_id: paiementData.utilisateur_id,
        seance_id: reservation.seance_id
      });
    }

    return paiement;
  }

  async simulerPaiement(methode) {
    // Simulation simple : 90% de succès, 10% d'échec
    const success = Math.random() > 0.1;

    if (success) {
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'paye';
    } else {
      return 'annule';
    }
  }

  async getPaiementsByUser(userId) {
    const paiements = await db.paiements.findAll({
      where: { utilisateur_id: userId },
      include: [
        {
          model: db.reservations,
          as: 'reservation',
          include: [
            { model: db.seances, as: 'seance', include: [{ model: db.films, as: 'film' }] }
          ]
        }
      ],
      order: [['date_paiement', 'DESC']]
    });

    return paiements;
  }

  async getPaiementById(id) {
    const paiement = await db.paiements.findByPk(id, {
      include: [
        {
          model: db.reservations,
          as: 'reservation',
          include: [
            { model: db.seances, as: 'seance', include: [{ model: db.films, as: 'film' }] },
            { model: db.utilisateurs, as: 'utilisateur' }
          ]
        }
      ]
    });

    if (!paiement) {
      throw new Error("Paiement introuvable");
    }

    return paiement;
  }

  async updatePaiementStatus(id, newStatus) {
    const paiement = await this.getPaiementById(id);

    const statutsValides = ['en_attente', 'paye', 'annule', 'rembourse'];
    if (!statutsValides.includes(newStatus)) {
      throw new Error("Statut de paiement invalide");
    }

    await paiement.update({
      statut: newStatus,
      date_paiement: newStatus === 'paye' ? new Date() : paiement.date_paiement
    });

    // Mettre à jour le statut de la réservation en conséquence
    if (newStatus === 'rembourse') {
      await paiement.reservation.update({ statut: 'ANNULEE' });
    } else if (newStatus === 'paye') {
      await paiement.reservation.update({ statut: 'PAYEE' });
    }

    return paiement;
  }

  async rembourserPaiement(id) {
    return await this.updatePaiementStatus(id, 'rembourse');
  }

  async getStatistiquesPaiements() {
    const stats = await db.paiements.findAll({
      attributes: [
        'statut',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        [db.sequelize.fn('SUM', db.sequelize.col('montant')), 'total']
      ],
      group: ['statut']
    });

    return stats;
  }

  generateCodeBillet() {
    // Générer un code unique pour le billet
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BILLET-${timestamp}-${random}`;
  }
}

module.exports = new PaiementService();