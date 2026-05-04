const categorieService = require("../services/categorieService");

const createCategorie = async (req, res) => {
  try {
    const categorie = await categorieService.createCategorie(req.body);

    res.status(201).json({
      message: "Catégorie créée avec succès",
      categorie,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categorieService.getAllCategories();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories",
    });
  }
};

const getCategorieById = async (req, res) => {
  try {
    const categorie = await categorieService.getCategorieById(req.params.id);

    res.status(200).json(categorie);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateCategorie = async (req, res) => {
  try {
    const categorie = await categorieService.updateCategorie(req.params.id, req.body);

    res.status(200).json({
      message: "Catégorie modifiée avec succès",
      categorie,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteCategorie = async (req, res) => {
  try {
    const result = await categorieService.deleteCategorie(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie,
};