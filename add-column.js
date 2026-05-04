const sequelize = require('./config/db');

async function addMaxReservationsColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à MySQL réussie');

    // Ajouter la colonne max_reservations à la table utilisateurs
    await sequelize.query(`
      ALTER TABLE utilisateurs
      ADD COLUMN max_reservations INT NOT NULL DEFAULT 5
    `);

    console.log('Colonne max_reservations ajoutée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la colonne:', error.message);
    process.exit(1);
  }
}

addMaxReservationsColumn();