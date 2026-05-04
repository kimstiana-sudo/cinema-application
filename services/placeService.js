const db = require("../models");
const { Op } = require("sequelize");

class PlaceService {
  async createPlace(placeData) {
    // Validation basique
    if (!placeData.numero || !placeData.rang || !placeData.salle_id) {
      throw new Error("Numéro, rang et salle sont requis");
    }

    // Vérifier que la salle existe
    const salle = await db.salles.findByPk(placeData.salle_id);
    if (!salle) {
      throw new Error("Salle introuvable");
    }

    // Vérifier que la place n'existe pas déjà dans cette salle
    const existing = await db.places.findOne({
      where: {
        numero: placeData.numero,
        rang: placeData.rang,
        salle_id: placeData.salle_id
      }
    });

    if (existing) {
      throw new Error("Une place avec ce numéro existe déjà dans cette salle");
    }

    const place = await db.places.create(placeData);
    return place;
  }

  async getPlacesBySalle(salleId) {
    const places = await db.places.findAll({
      where: { salle_id: salleId },
      order: [['rang', 'ASC'], ['numero', 'ASC']]
    });
    return places;
  }

  async getPlaceById(id) {
    const place = await db.places.findByPk(id, {
      include: [{ model: db.salles, as: 'salle' }]
    });

    if (!place) {
      throw new Error("Place introuvable");
    }

    return place;
  }

  async updatePlace(id, updateData) {
    const place = await this.getPlaceById(id);

    // Vérifier la combinaison numero/rang/salle si modifiée
    if ((updateData.numero && updateData.numero !== place.numero) ||
        (updateData.rang && updateData.rang !== place.rang) ||
        (updateData.salle_id && updateData.salle_id !== place.salle_id)) {

      const salleId = updateData.salle_id || place.salle_id;
      const numero = updateData.numero || place.numero;
      const rang = updateData.rang || place.rang;

      const existing = await db.places.findOne({
        where: {
          numero,
          rang,
          salle_id: salleId,
          id: { [Op.ne]: id }
        }
      });

      if (existing) {
        throw new Error("Une place avec cette combinaison existe déjà");
      }
    }

    await place.update(updateData);
    return place;
  }

  async deletePlace(id) {
    const place = await this.getPlaceById(id);

    // Vérifier si la place est réservée (logique à implémenter selon besoin)
    // Pour l'instant, on permet la suppression

    await place.destroy();
    return { message: "Place supprimée avec succès" };
  }

  async createPlacesForSalle(salleId, layout) {
    // layout pourrait être un objet décrivant la disposition (ex: { rangs: ['A', 'B'], placesParRang: 10 })
    const places = [];

    for (const rang of layout.rangs) {
      for (let i = 1; i <= layout.placesParRang; i++) {
        const numero = i.toString().padStart(2, '0'); // 01, 02, etc.
        places.push({
          numero,
          rang,
          salle_id: salleId,
          disponible: true
        });
      }
    }

    // Créer toutes les places en une fois
    const createdPlaces = await db.places.bulkCreate(places);
    return createdPlaces;
  }

  async getPlacesDisponibles(seanceId) {
    // Récupérer la salle de la séance
    const seance = await db.seances.findByPk(seanceId, {
      include: [{ model: db.salles, as: 'salle' }]
    });

    if (!seance) {
      throw new Error("Séance introuvable");
    }

    // Récupérer toutes les places de la salle
    const allPlaces = await db.places.findAll({
      where: { salle_id: seance.salle.id },
      order: [['rang', 'ASC'], ['numero', 'ASC']]
    });

    // Récupérer les places déjà réservées pour cette séance
    const reservedPlaces = await db.reservations.findAll({
      where: { seance_id: seanceId },
      include: [{
        model: db.places,
        as: 'places'
      }]
    });

    // Collecter les IDs des places réservées
    const reservedPlaceIds = new Set();
    reservedPlaces.forEach(reservation => {
      if (reservation.places) {
        reservation.places.forEach(place => {
          reservedPlaceIds.add(place.id);
        });
      }
    });

    // Marquer les places comme disponibles ou non
    return allPlaces.map(place => ({
      ...place.toJSON(),
      disponible: !reservedPlaceIds.has(place.id)
    }));
  }
}

module.exports = new PlaceService();