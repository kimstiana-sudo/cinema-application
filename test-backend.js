// Script de test pour vérifier les fonctionnalités du backend cinéma
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test des catégories (pas besoin d'authentification)
async function testCategories() {
  try {
    console.log('🧪 Test des catégories...');
    const response = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Catégories récupérées:', response.data.length, 'catégories');
  } catch (error) {
    console.log('❌ Erreur catégories:', error.message);
  }
}

// Test des places disponibles
async function testPlacesDisponibles(seanceId = 1) {
  try {
    console.log('🧪 Test des places disponibles...');
    const response = await axios.get(`${BASE_URL}/places/disponibles/${seanceId}`);
    console.log('✅ Places disponibles récupérées');
  } catch (error) {
    console.log('❌ Erreur places:', error.message);
  }
}

// Test de l'inscription
async function testRegister() {
  try {
    console.log('🧪 Test inscription...');
    const userData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'password123'
    };
    const response = await axios.post(`${BASE_URL}/register`, userData, { timeout: 5000 });
    console.log('✅ Utilisateur inscrit:', response.data.user.email);
    return true; // Success
  } catch (error) {
    console.log('❌ Erreur inscription:', error.response?.status, '-', error.response?.data?.message || error.message);
    return false;
  }
}

// Test de connexion
async function testLogin() {
  try {
    console.log('🧪 Test connexion...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    const response = await axios.post(`${BASE_URL}/connexion`, loginData);
    console.log('✅ Connexion réussie');
    return response.data.token;
  } catch (error) {
    console.log('❌ Erreur connexion:', error.message);
    return null;
  }
}

// Test des films
async function testFilms(token) {
  try {
    console.log('🧪 Test récupération films...');
    const response = await axios.get(`${BASE_URL}/films`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Films récupérés:', response.data.length, 'films');
  } catch (error) {
    console.log('❌ Erreur films:', error.message);
  }
}

// Test des séances
async function testSeances(token) {
  try {
    console.log('🧪 Test récupération séances...');
    const response = await axios.get(`${BASE_URL}/seances`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Séances récupérées:', response.data.length, 'séances');
    if (response.data.length > 0) {
      console.log('Premier ID de séance:', response.data[0].id);
    }
    return response.data;
  } catch (error) {
    console.log('❌ Erreur séances:', error.message);
    return [];
  }
}

// Test des réservations utilisateur
async function testReservations(token) {
  try {
    console.log('🧪 Test récupération réservations utilisateur...');
    const response = await axios.get(`${BASE_URL}/reservations/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Réservations récupérées:', response.data.length, 'réservations');
  } catch (error) {
    console.log('❌ Erreur réservations:', error.message);
  }
}

// Test de création de réservation
async function testCreateReservation(token, seanceId) {
  try {
    console.log('🧪 Test création de réservation...');
    const reservationData = {
      seance_id: seanceId,
      place_ids: [1, 2] // IDs de places
    };
    const response = await axios.post(`${BASE_URL}/reservations`, reservationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Réservation créée');
  } catch (error) {
    console.log('❌ Erreur création réservation:', error.response?.data?.message || error.message);
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Démarrage des tests du backend cinéma...\n');

  // Tests sans authentification
  await testCategories();

  // Test de connexion d'abord
  let token = await testLogin();

  if (!token) {
    // Si connexion échoue, essayer inscription
    const registered = await testRegister();
    if (registered) {
      token = await testLogin();
    }
  }

  if (token) {
    // Tests avec authentification
    await testFilms(token);
    const seances = await testSeances(token);
    
    // Test des places avec un ID de séance valide
    if (seances.length > 0) {
      await testPlacesDisponibles(seances[0].id);
    } else {
      await testPlacesDisponibles();
    }

    // Test des réservations
    await testReservations(token);
    await testCreateReservation(token, seances[0].id);
  }

  console.log('\n✨ Tests terminés !');
}

// Exécuter les tests
runTests().catch(console.error);