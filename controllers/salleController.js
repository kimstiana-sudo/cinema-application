const salleService = require("../services/salleService");

const createSalle = async (req, res) => {
  try {
    const salle = await salleService.createSalle(req.body);

    res.status(201).json({
      message: "Salle créée avec succès",
      salle,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getSalles = async (req, res) => {
  try {
    const salles = await salleService.getAllSalles();

    res.status(200).json(salles);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des salles",
      detail: error.message
    });
  }
};

const getSalleById = async (req, res) => {
  try {
    const salle = await salleService.getSalleById(req.params.id);

    res.status(200).json(salle);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateSalle = async (req, res) => {
  try {
    const salle = await salleService.updateSalle(req.params.id, req.body);

    res.status(200).json({
      message: "Salle modifiée avec succès",
      salle,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteSalle = async (req, res) => {
  try {
    const result = await salleService.deleteSalle(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSalle,
  getSalles,
  getSalleById,
  updateSalle,
  deleteSalle,
};