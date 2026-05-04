const sequelize = require("../config/db");

const db = {};

const Sequelize = require("sequelize");
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.roles = require("./role");
db.utilisateurs = require("./user");
db.categories = require("./categorie");
db.films = require("./film");
db.salles = require("./salle");
db.places = require("./place");
db.seances = require("./seance");
db.reservations = require("./reservation");
db.paiements = require("./paiement");
db.billets = require("./billet");

// ===== ASSOCIATIONS =====

// Role <-> Utilisateur
db.roles.hasMany(db.utilisateurs, { foreignKey: "roleId", as: "utilisateurs" });
db.utilisateurs.belongsTo(db.roles, { foreignKey: "roleId", as: "role" });

// Categorie <-> Film
db.categories.hasMany(db.films, { foreignKey: "categorie_id", as: "films" });
db.films.belongsTo(db.categories, { foreignKey: "categorie_id", as: "categorie" });

// Film <-> Seance
db.films.hasMany(db.seances, { foreignKey: "film_id", as: "seances" });
db.seances.belongsTo(db.films, { foreignKey: "film_id", as: "film" });

// Salle <-> Seance
db.salles.hasMany(db.seances, { foreignKey: "salle_id", as: "seances" });
db.seances.belongsTo(db.salles, { foreignKey: "salle_id", as: "salle" });

// Salle <-> Place
db.salles.hasMany(db.places, { foreignKey: "salle_id", as: "places" });
db.places.belongsTo(db.salles, { foreignKey: "salle_id", as: "salle" });

// Utilisateur <-> Reservation
db.utilisateurs.hasMany(db.reservations, { foreignKey: "utilisateur_id", as: "reservations" });
db.reservations.belongsTo(db.utilisateurs, { foreignKey: "utilisateur_id", as: "utilisateur" });

// Seance <-> Reservation
db.seances.hasMany(db.reservations, { foreignKey: "seance_id", as: "reservations" });
db.reservations.belongsTo(db.seances, { foreignKey: "seance_id", as: "seance" });

// Reservation <-> Place (many-to-many)
db.reservations.belongsToMany(db.places, {
  through: "reservation_sieges",
  foreignKey: "reservation_id",
  otherKey: "place_id",
  as: "places"
});
db.places.belongsToMany(db.reservations, {
  through: "reservation_sieges",
  foreignKey: "place_id",
  otherKey: "reservation_id",
  as: "reservations"
});

// Reservation <-> Paiement
db.reservations.hasMany(db.paiements, { foreignKey: "reservation_id", as: "paiements" });
db.paiements.belongsTo(db.reservations, { foreignKey: "reservation_id", as: "reservation" });

// Utilisateur <-> Paiement
db.utilisateurs.hasMany(db.paiements, { foreignKey: "utilisateur_id", as: "paiements" });
db.paiements.belongsTo(db.utilisateurs, { foreignKey: "utilisateur_id", as: "utilisateur" });

// Reservation <-> Billet
db.reservations.hasMany(db.billets, { foreignKey: "reservation_id", as: "billets" });
db.billets.belongsTo(db.reservations, { foreignKey: "reservation_id", as: "reservation" });

// Utilisateur <-> Billet
db.utilisateurs.hasMany(db.billets, { foreignKey: "utilisateur_id", as: "billets" });
db.billets.belongsTo(db.utilisateurs, { foreignKey: "utilisateur_id", as: "utilisateur" });

// Seance <-> Billet
db.seances.hasMany(db.billets, { foreignKey: "seance_id", as: "billets" });
db.billets.belongsTo(db.seances, { foreignKey: "seance_id", as: "seance" });

module.exports = db;
