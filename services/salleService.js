const db = require("../models");
const { Op } = require("sequelize");

class SalleService {
  async createSalle(salleData) {
    // Validation basique
    if (!salleData.nom || !salleData.capacite) {
      throw new Error("Nom et capacité sont requis");
    }

    if (salleData.capacite <= 0) {
      throw new Error("La capacité doit être supérieure à 0");
    }

    // Vérifier si le nom existe déjà
    const existingSalle = await db.salles.findOne({
      where: { nom: salleData.nom }
    });

    if (existingSalle) {
      throw new Error("Une salle avec ce nom existe déjà");
    }

    const salle = await db.salles.create(salleData);
    return salle;
  }

  async getAllSalles() {
    const salles = await db.salles.findAll({
      order: [['nom', 'ASC']]
    });
    return salles;
  }

  async getSalleById(id) {
    const salle = await db.salles.findByPk(id);
    if (!salle) {
      throw new Error("Salle introuvable");
    }
    return salle;
  }

  async updateSalle(id, updateData) {
    const salle = await this.getSalleById(id);

    // Vérifier le nom si changé
    if (updateData.nom && updateData.nom !== salle.nom) {
      const existingSalle = await db.salles.findOne({
        where: { nom: updateData.nom, id: { [Op.ne]: id } }
      });

      if (existingSalle) {
        throw new Error("Une salle avec ce nom existe déjà");
      }
    }

    // Validation capacité
    if (updateData.capacite && updateData.capacite <= 0) {
      throw new Error("La capacité doit être supérieure à 0");
    }

    await salle.update(updateData);
    return salle;
  }

  async deleteSalle(id) {
    const salle = await this.getSalleById(id);

    // Vérifier s'il y a des séances associées
    const seancesAssociees = await db.seances.findAll({
      where: { salle_id: id }
    });

    if (seancesAssociees.length > 0) {
      throw new Error("Impossible de supprimer cette salle car des séances y sont programmées");
    }

    await salle.destroy();
    return { message: "Salle supprimée avec succès" };
  }

  async getSalleWithSeances(id) {
    const salle = await db.salles.findByPk(id, {
      include: [{
        model: db.seances,
        as: 'seances',
        include: [{
          model: db.films,
          as: 'film'
        }]
      }],
      order: [[{ model: db.seances, as: 'seances' }, 'dateHeure', 'ASC']]
    });

    if (!salle) {
      throw new Error("Salle introuvable");
    }

    return salle;
  }
}

module.exports = new SalleService();