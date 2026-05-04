const db = require("../models");

class FilmService {
  async createFilm(filmData) {
    // Validation basique
    if (!filmData.titre || !filmData.duree_min) {
      throw new Error("Titre et durée sont requis");
    }
    // Accepter description ou sommaire
    if (filmData.description && !filmData.sommaire) filmData.sommaire = filmData.description;

    const film = await db.films.create(filmData);
    return film;
  }

  async getAllFilms() {
    const films = await db.films.findAll({
      order: [['id', 'ASC']]
    });
    return films;
  }

  async getFilmById(id) {
    const film = await db.films.findByPk(id);
    if (!film) {
      throw new Error("Film introuvable");
    }
    return film;
  }

  async updateFilm(id, updateData) {
    const film = await this.getFilmById(id);

    // Validation basique
    if (updateData.titre === "") {
      throw new Error("Le titre ne peut pas être vide");
    }

    await film.update(updateData);
    return film;
  }

  async deleteFilm(id) {
    const film = await this.getFilmById(id);

    // Vérifier s'il y a des séances associées
    const seancesAssociees = await db.seances.findAll({
      where: { film_id: id }
    });

    if (seancesAssociees.length > 0) {
      throw new Error("Impossible de supprimer ce film car des séances y sont associées");
    }

    await film.destroy();
    return { message: "Film supprimé avec succès" };
  }

  async getFilmsWithSeances() {
    const films = await db.films.findAll({
      include: [{
        model: db.seances,
        as: 'seances',
        include: [{
          model: db.salles,
          as: 'salle'
        }]
      }],
      order: [['titre', 'ASC']]
    });
    return films;
  }
}

module.exports = new FilmService();