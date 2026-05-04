const filmService = require("../services/filmService");

const createFilm = async (req, res) => {
  try {
    const film = await filmService.createFilm(req.body);

    res.status(201).json({
      message: "Film ajouté avec succès",
      film,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAllFilms = async (req, res) => {
  try {
    const films = await filmService.getAllFilms();

    res.status(200).json(films);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      detail: error.message,
      stack: error.stack
    });
  }
};

const getFilmById = async (req, res) => {
  try {
    const film = await filmService.getFilmById(req.params.id);

    res.status(200).json(film);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateFilm = async (req, res) => {
  try {
    const film = await filmService.updateFilm(req.params.id, req.body);

    res.status(200).json({
      message: "Film modifié avec succès",
      film,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteFilm = async (req, res) => {
  try {
    const result = await filmService.deleteFilm(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createFilm,
  getAllFilms,
  getFilmById,
  updateFilm,
  deleteFilm,
};