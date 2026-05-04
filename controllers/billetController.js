const billetService = require("../services/billetService");

const createBillet = async (req, res) => {
  try {
    const billetData = {
      ...req.body,
      utilisateur_id: req.user.id, // req.user défini par le middleware verifyToken
    };

    const billet = await billetService.createBillet(billetData);

    res.status(201).json({
      message: "Billet généré avec succès",
      billet,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const createBilletsForReservation = async (req, res) => {
  try {
    const { reservation_id } = req.body;

    if (!reservation_id) {
      return res.status(400).json({
        message: "ID de réservation requis",
      });
    }

    const billets = await billetService.createBilletsForReservation(reservation_id);

    res.status(201).json({
      message: `${billets.length} billet(s) généré(s) avec succès`,
      billets,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getBilletsByUser = async (req, res) => {
  try {
    const userId = req.user.id; // req.user défini par le middleware verifyToken

    const billets = await billetService.getBilletsByUser(userId);

    res.status(200).json(billets);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des billets",
    });
  }
};

const getBilletById = async (req, res) => {
  try {
    const billet = await billetService.getBilletById(req.params.id);

    res.status(200).json(billet);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getBilletByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const billet = await billetService.getBilletByCode(code);

    res.status(200).json(billet);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const validateBillet = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Code du billet requis",
      });
    }

    const result = await billetService.validateBillet(code);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteBillet = async (req, res) => {
  try {
    const result = await billetService.deleteBillet(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBillet,
  createBilletsForReservation,
  getBilletsByUser,
  getBilletById,
  getBilletByCode,
  validateBillet,
  deleteBillet,
};