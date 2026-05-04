const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

async function checkTables() {
  try {
    console.log("🔍 Vérification des tables dans la base de données...\n");

    // Se connecter à la base
    await sequelize.authenticate();
    console.log("✅ Connexion à MySQL réussie\n");

    // Récupérer la liste des tables
    const [results] = await sequelize.query("SHOW TABLES");

    console.log("📋 Tables trouvées dans la base de données:");
    console.log("=".repeat(50));

    const tables = results.map(row => Object.values(row)[0]);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });

    console.log("\n" + "=".repeat(50));

    // Tables attendues selon les modèles
    const expectedTables = [
      'utilisateurs',
      'roles',
      'categories',
      'films',
      'salles',
      'places',
      'seances',
      'reservations',
      'paiements',
      'billets'
    ];

    console.log("\n🔍 Vérification des tables attendues:");
    let allPresent = true;

    expectedTables.forEach(table => {
      const exists = tables.includes(table);
      const status = exists ? "✅" : "❌";
      console.log(`${status} ${table}`);

      if (!exists) {
        allPresent = false;
      }
    });

    console.log("\n" + "=".repeat(50));
    if (allPresent) {
      console.log("🎉 Toutes les tables nécessaires sont présentes !");
    } else {
      console.log("⚠️ Certaines tables sont manquantes.");
    }

    // Vérifier le contenu de quelques tables
    console.log("\n📊 Vérification du contenu des tables:");

    for (const table of expectedTables) {
      try {
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult[0].count;
        console.log(`📋 ${table}: ${count} enregistrement(s)`);
      } catch (error) {
        console.log(`❌ ${table}: Erreur lors de la vérification (${error.message})`);
      }
    }

  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
  } finally {
    await sequelize.close();
  }
}

checkTables();