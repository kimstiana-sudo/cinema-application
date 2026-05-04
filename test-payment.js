const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPayment() {
  try {
    console.log('🧪 Test du paiement...');

    // D'abord se connecter
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    const loginResponse = await axios.post(`${BASE_URL}/connexion`, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie, token obtenu');

    // Récupérer les réservations de l'utilisateur
    const reservationsResponse = await axios.get(`${BASE_URL}/reservations/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (reservationsResponse.data.length === 0) {
      console.log('❌ Aucune réservation trouvée pour tester le paiement');
      return;
    }

    const reservationId = reservationsResponse.data[0].id;
    console.log('📋 Test du paiement pour la réservation ID:', reservationId);

    // Tester le paiement
    const paymentData = {
      reservationId: reservationId,
      numeroCarte: '123456789012345678' // 18 chiffres
    };

    const paymentResponse = await axios.post(`${BASE_URL}/paiements`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Paiement réussi:', paymentResponse.data);

  } catch (error) {
    console.log('❌ Erreur paiement:', error.response?.status, '-', error.response?.data?.message || error.message);
    console.log('Erreur complète:', error);
  }
}

testPayment();