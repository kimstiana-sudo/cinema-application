const db = require("./models");

async function seedCategories() {
  try {
    console.log("🌱 Ajout des catégories par défaut...");

    const categories = [
      { nom: "Action", description: "Films d'action et d'aventure" },
      { nom: "Comédie", description: "Films comiques et humoristiques" },
      { nom: "Drame", description: "Films dramatiques et émotionnels" },
      { nom: "Science-fiction", description: "Films de science-fiction et fantastique" },
      { nom: "Horreur", description: "Films d'horreur et thriller" },
      { nom: "Romance", description: "Films romantiques et sentimentaux" },
      { nom: "Animation", description: "Films d'animation pour tous âges" },
      { nom: "Documentaire", description: "Films documentaires et biographiques" }
    ];

    let count = 0;
    for (const categorie of categories) {
      // Vérifier si la catégorie existe déjà
      const existing = await db.categories.findOne({
        where: { nom: categorie.nom }
      });

      if (!existing) {
        await db.categories.create(categorie);
        count++;
        console.log(`✅ Catégorie ajoutée: ${categorie.nom}`);
      } else {
        console.log(`⏭️ Catégorie déjà existante: ${categorie.nom}`);
      }
    }

    console.log(`\n🎉 ${count} catégorie(s) ajoutée(s) avec succès !`);

    // Vérifier le résultat
    const totalCategories = await db.categories.count();
    console.log(`📊 Total des catégories: ${totalCategories}`);

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des catégories:", error);
  } finally {
    await db.sequelize.close();
  }
}

seedCategories();