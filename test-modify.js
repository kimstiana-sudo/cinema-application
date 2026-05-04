const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testModifyReservation() {
  try {
    console.log('🧪 Test de modification de réservation...');

    // D'abord se connecter
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/connexion`, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');

    // Modifier la réservation 16 (changer les places)
    const modifyData = {
      place_ids: [5, 6, 7]
    };

    const modifyResponse = await axios.put(`${BASE_URL}/reservations/16/modify`, modifyData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Réservation modifiée:', modifyResponse.data);

  } catch (error) {
    console.error('❌ Erreur:', error.response ? error.response.data : error.message);
  }
}

testModifyReservation();