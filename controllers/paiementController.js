const { reservations, seances } = require("../models");
const paiementService = require("../services/paiementService");

const createPaiement = async (req, res) => {
  try {
    const { reservationId, numeroCarte } = req.body;

    // Récupérer la réservation
    const reservation = await reservations.findByPk(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    // Vérifier que la réservation appartient à l'utilisateur
    if (reservation.utilisateur_id !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Récupérer la séance pour le prix
    const seance = await seances.findByPk(reservation.seance_id);
    if (!seance) {
      return res.status(404).json({ message: "Séance introuvable" });
    }

    // Utiliser le nombre de places stocké dans la réservation
    const placesCount = reservation.nombrePlace;

    // Calculer le montant
    const montant = seance.prix * placesCount;

    const paiementData = {
      montant: montant,
      methode: 'carte',
      reservation_id: reservationId,
      utilisateur_id: req.user.id,
      card_number: numeroCarte
    };

    const paiement = await paiementService.createPaiement(paiementData);

    res.status(201).json({
      message: "Paiement traité",
      paiement,
    });
  } catch (error) {
    console.error('Erreur dans createPaiement:', error.message);
    res.status(400).json({
      message: error.message,
    });
  }
};

const getPaiementsByUser = async (req, res) => {
  try {
    const userId = req.user.id; // req.user défini par le middleware verifyToken

    const paiements = await paiementService.getPaiementsByUser(userId);

    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
    });
  }
};

const getPaiementById = async (req, res) => {
  try {
    const paiement = await paiementService.getPaiementById(req.params.id);

    res.status(200).json(paiement);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updatePaiementStatus = async (req, res) => {
  try {
    const { statut } = req.body;

    const paiement = await paiementService.updatePaiementStatus(req.params.id, statut);

    res.status(200).json({
      message: "Statut du paiement mis à jour",
      paiement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const rembourserPaiement = async (req, res) => {
  try {
    const paiement = await paiementService.rembourserPaiement(req.params.id);

    res.status(200).json({
      message: "Paiement remboursé",
      paiement,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getStatistiquesPaiements = async (req, res) => {
  try {
    const stats = await paiementService.getStatistiquesPaiements();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
    });
  }
};

module.exports = {
  createPaiement,
  getPaiementsByUser,
  getPaiementById,
  updatePaiementStatus,
  rembourserPaiement,
  getStatistiquesPaiements,
};