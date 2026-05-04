const db = require("./models");

async function seedPlaces() {
  try {
    console.log("🌱 Ajout des places par défaut pour les salles...");

    // Récupérer toutes les salles
    const salles = await db.salles.findAll();

    if (salles.length === 0) {
      console.log("❌ Aucune salle trouvée. Veuillez créer des salles d'abord.");
      return;
    }

    console.log(`📋 ${salles.length} salle(s) trouvée(s)`);

    let totalPlaces = 0;

    for (const salle of salles) {
      console.log(`\n🏛️ Traitement de la salle: ${salle.nom} (capacité: ${salle.capacite})`);

      // Vérifier si des places existent déjà pour cette salle
      const existingPlaces = await db.places.count({
        where: { salle_id: salle.id }
      });

      if (existingPlaces > 0) {
        console.log(`⏭️ Places déjà créées pour cette salle (${existingPlaces} places)`);
        continue;
      }

      // Créer les places pour cette salle
      // Supposons un format de 10 rangs avec un nombre variable de places par rang
      const placesParRang = Math.ceil(salle.capacite / 10); // Distribution sur 10 rangs
      const places = [];

      for (let rang = 1; rang <= 10; rang++) {
        for (let numero = 1; numero <= placesParRang && places.length < salle.capacite; numero++) {
          places.push({
            numero: numero,
            rang: rang,
            salle_id: salle.id
          });
        }
      }

      // Insérer les places en bulk
      await db.places.bulkCreate(places);

      console.log(`✅ ${places.length} places créées pour la salle ${salle.nom}`);
      totalPlaces += places.length;
    }

    console.log(`\n🎉 ${totalPlaces} place(s) ajoutée(s) au total !`);

    // Vérifier le résultat
    const totalPlacesInDB = await db.places.count();
    console.log(`📊 Total des places dans la DB: ${totalPlacesInDB}`);

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout des places:", error);
  } finally {
    await db.sequelize.close();
  }
}

seedPlaces();