// Test simple de connectivité
const axios = require('axios');

async function testConnectivity() {
  try {
    console.log('🔍 Test de connectivité...');
    const response = await axios.get('http://localhost:3000/', { timeout: 5000 });
    console.log('✅ Serveur répond:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Serveur ne répond pas:', error.code, error.message);
    return false;
  }
}

async function testAPIRoot() {
  try {
    console.log('🔍 Test API root...');
    const response = await axios.get('http://localhost:3000/api/categories', { timeout: 5000 });
    console.log('✅ API répond:', response.data);
  } catch (error) {
    console.log('❌ API erreur:', error.response?.status, error.response?.statusText, error.message);
  }
}

testConnectivity().then(isConnected => {
  if (isConnected) {
    testAPIRoot();
  }
});