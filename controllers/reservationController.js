const reservationService = require("../services/reservationService");

const createReservation = async (req, res) => {
  try {
    const reservationData = {
      ...req.body,
      utilisateur_id: req.user.id, // req.user défini par le middleware verifyToken
    };

    const reservation = await reservationService.createReservation(reservationData);

    res.status(201).json({
      message: "Réservation réussie",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user.id; // req.user défini par le middleware verifyToken

    const reservations = await reservationService.getReservationsByUser(userId);

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
    });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations();

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
    });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);

    if (req.user.role !== 'agent' && req.user.role !== 'admin' && reservation.utilisateur_id !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const userId = req.user.id; // req.user défini par le middleware verifyToken

    const reservation = await reservationService.cancelReservation(req.params.id, userId);

    res.status(200).json({
      message: "Réservation annulée avec succès",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { statut } = req.body;

    const reservation = await reservationService.updateReservationStatus(req.params.id, statut);

    res.status(200).json({
      message: "Statut de la réservation mis à jour",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const modifyReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const place_ids = req.body.place_ids || req.body.places;

    const reservation = await reservationService.modifyReservation(req.params.id, userId, place_ids);

    res.status(200).json({
      message: "Réservation modifiée avec succès",
      reservation,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await reservationService.deleteReservation(req.params.id, userId);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getReservationStatistics = async (req, res) => {
  try {
    const stats = await reservationService.getReservationStatistics();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
    });
  }
};

module.exports = {
  createReservation,
  getReservationsByUser,
  getAllReservations,
  getReservationById,
  cancelReservation,
  updateReservationStatus,
  modifyReservation,
  deleteReservation,
  getReservationStatistics,
};