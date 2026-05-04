const seanceService = require("../services/seanceService");

const createSeance = async (req, res) => {
  try {
    const seance = await seanceService.createSeance(req.body);

    res.status(201).json({
      message: "Séance créée avec succès",
      seance,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getSeancesByFilm = async (req, res) => {
  try {
    const seances = await seanceService.getSeancesByFilm(req.params.film_id);

    res.status(200).json(seances);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllSeances = async (req, res) => {
  try {
    let seances;
    if (req.query.film_id) {
      seances = await seanceService.getSeancesByFilm(req.query.film_id);
    } else {
      seances = await seanceService.getAllSeances();
    }
    res.status(200).json(seances);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des séances", detail: error.message,
    });
  }
};

const getSeanceById = async (req, res) => {
  try {
    const seance = await seanceService.getSeanceById(req.params.id);

    res.status(200).json(seance);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateSeance = async (req, res) => {
  try {
    const seance = await seanceService.updateSeance(req.params.id, req.body);

    res.status(200).json({
      message: "Séance modifiée avec succès",
      seance,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteSeance = async (req, res) => {
  try {
    const result = await seanceService.deleteSeance(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getPlacesDisponibles = async (req, res) => {
  try {
    const places = await seanceService.getPlacesDisponibles(req.params.id);

    res.status(200).json(places);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSeance,
  getSeancesByFilm,
  getAllSeances,
  getSeanceById,
  updateSeance,
  deleteSeance,
  getPlacesDisponibles,
};