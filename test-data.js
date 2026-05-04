// Test rapide des données ajoutées
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testData() {
  try {
    console.log('🧪 Test des données ajoutées...\n');

    // Test des catégories
    console.log('Test catégories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, { timeout: 5000 });
    console.log(`✅ Catégories: ${categoriesResponse.data.length} trouvées\n`);

    // Test des salles
    console.log('Test salles...');
    const sallesResponse = await axios.get(`${BASE_URL}/salles`, { timeout: 5000 });
    console.log(`✅ Salles: ${sallesResponse.data.length} trouvées\n`);

    console.log('🎉 Tests réussis !');

  } catch (error) {
    console.log('❌ Erreur:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testData();