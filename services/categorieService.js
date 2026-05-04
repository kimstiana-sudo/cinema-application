const db = require("../models");
const { Op } = require("sequelize");

class CategorieService {
  async createCategorie(categorieData) {
    // Validation basique
    if (!categorieData.nom) {
      throw new Error("Le nom de la catégorie est requis");
    }

    // Vérifier si le nom existe déjà
    const existing = await db.categories.findOne({
      where: { nom: categorieData.nom }
    });

    if (existing) {
      throw new Error("Une catégorie avec ce nom existe déjà");
    }

    const categorie = await db.categories.create(categorieData);
    return categorie;
  }

  async getAllCategories() {
    const categories = await db.categories.findAll({
      order: [['nom', 'ASC']]
    });
    return categories;
  }

  async getCategorieById(id) {
    const categorie = await db.categories.findByPk(id);
    if (!categorie) {
      throw new Error("Catégorie introuvable");
    }
    return categorie;
  }

  async updateCategorie(id, updateData) {
    const categorie = await this.getCategorieById(id);

    // Vérifier le nom si changé
    if (updateData.nom && updateData.nom !== categorie.nom) {
      const existing = await db.categories.findOne({
        where: { nom: updateData.nom, id: { [Op.ne]: id } }
      });

      if (existing) {
        throw new Error("Une catégorie avec ce nom existe déjà");
      }
    }

    await categorie.update(updateData);
    return categorie;
  }

  async deleteCategorie(id) {
    const categorie = await this.getCategorieById(id);

    // Vérifier s'il y a des films associés
    const filmsAssocies = await db.films.findAll({
      where: { categorie_id: id }
    });

    if (filmsAssocies.length > 0) {
      throw new Error("Impossible de supprimer cette catégorie car des films y sont associés");
    }

    await categorie.destroy();
    return { message: "Catégorie supprimée avec succès" };
  }
}

module.exports = new CategorieService();