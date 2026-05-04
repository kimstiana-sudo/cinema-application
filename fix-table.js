const sequelize = require('./config/db');

async function recreateTable() {
  try {
    await sequelize.authenticate();
    console.log('Connexion réussie');

    // Supprimer la table
    await sequelize.query('DROP TABLE reservation_sieges');
    console.log('Table supprimée');

    // Recréer la table avec la bonne structure
    await sequelize.query(`
      CREATE TABLE reservation_sieges (
        reservation_id INT NOT NULL,
        place_id INT NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (reservation_id, place_id),
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
        FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
      )
    `);
    console.log('Table recréée avec la bonne structure');

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

recreateTable();