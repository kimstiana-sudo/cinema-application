const placeService = require("../services/placeService");

const createPlace = async (req, res) => {
  try {
    const place = await placeService.createPlace(req.body);

    res.status(201).json({
      message: "Place créée avec succès",
      place,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getPlacesBySalle = async (req, res) => {
  try {
    const places = await placeService.getPlacesBySalle(req.params.salle_id);

    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const place = await placeService.getPlaceById(req.params.id);

    res.status(200).json(place);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updatePlace = async (req, res) => {
  try {
    const place = await placeService.updatePlace(req.params.id, req.body);

    res.status(200).json({
      message: "Place modifiée avec succès",
      place,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deletePlace = async (req, res) => {
  try {
    const result = await placeService.deletePlace(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const createPlacesForSalle = async (req, res) => {
  try {
    const { salle_id, layout } = req.body;

    if (!salle_id || !layout) {
      return res.status(400).json({
        message: "Salle ID et layout sont requis",
      });
    }

    const places = await placeService.createPlacesForSalle(salle_id, layout);

    res.status(201).json({
      message: `${places.length} places créées avec succès`,
      places,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getPlacesDisponibles = async (req, res) => {
  try {
    const places = await placeService.getPlacesDisponibles(req.params.seance_id);

    res.status(200).json(places);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPlace,
  getPlacesBySalle,
  getPlaceById,
  updatePlace,
  deletePlace,
  createPlacesForSalle,
  getPlacesDisponibles,
};