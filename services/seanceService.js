const db = require("../models");
const { Op } = require("sequelize");

class SeanceService {
  async createSeance(seanceData) {
    // Validation basique
    if (!seanceData.dateHeure || !seanceData.prix || !seanceData.film_id || !seanceData.salle_id) {
      throw new Error("Date/heure, prix, film et salle sont requis");
    }

    // Vérifier que le film existe
    const film = await db.films.findByPk(seanceData.film_id);
    if (!film) {
      throw new Error("Film introuvable");
    }

    // Vérifier que la salle existe
    const salle = await db.salles.findByPk(seanceData.salle_id);
    if (!salle) {
      throw new Error("Salle introuvable");
    }

    // Vérifier qu'il n'y a pas de conflit horaire dans la même salle
    const dateDebut = new Date(seanceData.dateHeure);
    const dateFin = new Date(dateDebut.getTime() + film.duree_min * 60000); // durée en minutes

    const conflit = await db.seances.findOne({
      where: {
        salle_id: seanceData.salle_id,
        dateHeure: {
          [Op.lt]: dateFin,
          [Op.gte]: new Date(dateDebut.getTime() - film.duree_min * 60000)
        }
      }
    });

    if (conflit) {
      throw new Error("Conflit horaire dans cette salle");
    }

    const seance = await db.seances.create(seanceData);
    return seance;
  }

  async getSeancesByFilm(filmId) {
    const seances = await db.seances.findAll({
      where: { film_id: filmId },
      include: [
        { model: db.films, as: 'film' },
        { model: db.salles, as: 'salle' }
      ],
      order: [['dateHeure', 'ASC']]
    });
    return seances;
  }

  async getAllSeances() {
    const seances = await db.seances.findAll({
      include: [
        { model: db.films, as: 'film' },
        { model: db.salles, as: 'salle' }
      ],
      order: [['dateHeure', 'ASC']]
    });
    return seances;
  }

  async getSeanceById(id) {
    const seance = await db.seances.findByPk(id, {
      include: [
        { model: db.films, as: 'film' },
        { model: db.salles, as: 'salle' }
      ]
    });

    if (!seance) {
      throw new Error("Séance introuvable");
    }

    return seance;
  }

  async updateSeance(id, updateData) {
    const seance = await this.getSeanceById(id);

    // Si la date change, revérifier les conflits
    if (updateData.dateHeure) {
      const film = await db.films.findByPk(seance.film_id);
      const dateDebut = new Date(updateData.dateHeure);
      const dateFin = new Date(dateDebut.getTime() + film.duree_min * 60000);

      const conflit = await db.seances.findOne({
        where: {
          salle_id: seance.salle_id,
          id: { [Op.ne]: id }, // Exclure la séance actuelle
          dateHeure: {
            [Op.lt]: dateFin,
            [Op.gte]: new Date(dateDebut.getTime() - film.duree_min * 60000)
          }
        }
      });

      if (conflit) {
        throw new Error("Nouveau conflit horaire dans cette salle");
      }
    }

    await seance.update(updateData);
    return seance;
  }

  async deleteSeance(id) {
    const seance = await this.getSeanceById(id);

    // Vérifier s'il y a des réservations
    const reservations = await db.reservations.findAll({
      where: { seance_id: id }
    });

    if (reservations.length > 0) {
      throw new Error("Impossible de supprimer cette séance car des réservations existent");
    }

    await seance.destroy();
    return { message: "Séance supprimée avec succès" };
  }

  async getPlacesDisponibles(seanceId) {
    const seance = await db.seances.findByPk(seanceId, {
      include: [{ model: db.salles, as: 'salle' }]
    });

    if (!seance) {
      throw new Error("Séance introuvable");
    }

    // Calculer les places occupées
    const result = await db.reservations.findAll({
      where: { seance_id: seanceId },
      attributes: [
        [db.sequelize.fn('SUM', db.sequelize.col('nombrePlace')), 'totalOccupe']
      ]
    });

    const placesOccupees = result[0]?.dataValues.totalOccupe || 0;
    const placesDisponibles = seance.salle.capacite - placesOccupees;

    return {
      capacite: seance.salle.capacite,
      placesOccupees,
      placesDisponibles
    };
  }
}

module.exports = new SeanceService();