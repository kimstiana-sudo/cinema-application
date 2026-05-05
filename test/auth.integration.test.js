/**
 * ============================================================
 * TESTS D'INTÉGRATION - Module Authentification
 * ============================================================
 * Teste les endpoints HTTP réels avec supertest.
 * Mocke la BD pour ne pas avoir besoin d'une vraie connexion MySQL.
 */

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// ─── Mock BD avant tout require ───────────────────────────────
jest.mock('../models', () => ({
  utilisateurs: {
    findOne:  jest.fn(),
    findByPk: jest.fn(),
    create:   jest.fn(),
  },
  roles: {
    findOne: jest.fn(),
  },
  sequelize: { sync: jest.fn().mockResolvedValue(true), authenticate: jest.fn().mockResolvedValue(true) }
}));

// ─── Mock sync BD (évite la connexion MySQL au démarrage) ─────
jest.mock('../config/db', () => ({
  define:      jest.fn().mockReturnValue({}),
  authenticate: jest.fn().mockResolvedValue(true),
  sync:         jest.fn().mockResolvedValue(true),
  query:        jest.fn(),
}));

process.env.JWT_SECRET     = 'secret_integration_test';
process.env.DB_HOST        = 'localhost';
process.env.DB_USER        = 'root';
process.env.DB_PASSWORD    = 'test';
process.env.DB_NAME        = 'cinema_test';

// Créer une app Express légère pour les tests (sans démarrer le vrai serveur)
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);

const db = require('../models');

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================
// 1. POST /api/register
// =============================================================
describe('POST /api/register', () => {

  test('✅ 201 - Inscription réussie', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);
    db.roles.findOne.mockResolvedValue({ id: 1, nom: 'client' });
    db.utilisateurs.create.mockResolvedValue({
      id: 1, nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', roleId: 1
    });

    const res = await request(app)
      .post('/api/register')
      .send({ nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', password: 'motdepasse123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Compte créé avec succès');
    expect(res.body).toHaveProperty('user');
  });

  test('❌ 400 - Email déjà utilisé', async () => {
    db.utilisateurs.findOne.mockResolvedValue({ id: 1, email: 'jean@test.com' });

    const res = await request(app)
      .post('/api/register')
      .send({ nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', password: 'motdepasse123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email existe déjà/i);
  });

  test('❌ 400 - Champs manquants (sans prenom)', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ nom: 'Dupont', email: 'jean@test.com', password: 'abc' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('❌ 400 - Corps vide', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({});

    expect(res.status).toBe(400);
  });

  test('✅ Le mot de passe n\'est pas retourné en clair dans la réponse', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);
    db.roles.findOne.mockResolvedValue({ id: 1, nom: 'client' });
    db.utilisateurs.create.mockResolvedValue({
      id: 2, nom: 'Test', prenom: 'User',
      email: 'test@test.com', roleId: 1
      // pas de password dans la réponse mockée
    });

    const res = await request(app)
      .post('/api/register')
      .send({ nom: 'Test', prenom: 'User', email: 'test@test.com', password: 'secret' });

    expect(res.status).toBe(201);
    expect(res.body.user?.password).toBeUndefined();
  });
});

// =============================================================
// 2. POST /api/connexion
// =============================================================
describe('POST /api/connexion', () => {

  test('✅ 200 - Connexion réussie, retourne un token JWT', async () => {
    const hashedPw = await bcrypt.hash('motdepasse123', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 1, email: 'jean@test.com', password: hashedPw,
      nom: 'Dupont', prenom: 'Jean',
      role: { id: 1, nom: 'client' }
    });

    const res = await request(app)
      .post('/api/connexion')
      .send({ email: 'jean@test.com', password: 'motdepasse123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.message).toBe('Connexion réussie');

    // Vérifier le token
    const decoded = jwt.verify(res.body.token, 'secret_integration_test');
    expect(decoded.email).toBe('jean@test.com');
    expect(decoded.role).toBe('client');
  });

  test('❌ 401 - Email inconnu', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/connexion')
      .send({ email: 'inconnu@test.com', password: 'pass' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/introuvable/i);
  });

  test('❌ 401 - Mauvais mot de passe', async () => {
    const hashedPw = await bcrypt.hash('bonmotdepasse', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 1, email: 'jean@test.com', password: hashedPw,
      role: { id: 1, nom: 'client' }
    });

    const res = await request(app)
      .post('/api/connexion')
      .send({ email: 'jean@test.com', password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/mot de passe incorrect/i);
  });

  test('✅ Token contient les bonnes données pour un agent', async () => {
    const hashedPw = await bcrypt.hash('agent123', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 5, email: 'agent@cinema.com', password: hashedPw,
      nom: 'Martin', prenom: 'Luc',
      role: { id: 2, nom: 'agent' }
    });

    const res = await request(app)
      .post('/api/connexion')
      .send({ email: 'agent@cinema.com', password: 'agent123' });

    expect(res.status).toBe(200);
    const decoded = jwt.verify(res.body.token, 'secret_integration_test');
    expect(decoded.role).toBe('agent');
    expect(decoded.id).toBe(5);
  });
});

// =============================================================
// 3. GET /api/profile/:id
// =============================================================
describe('GET /api/profile/:id', () => {

  const validToken = jwt.sign(
    { id: 1, email: 'jean@test.com', role: 'client' },
    'secret_integration_test'
  );

  test('✅ 200 - Profil retourné avec token valide', async () => {
    db.utilisateurs.findByPk.mockResolvedValue({
      id: 1, nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', role: { nom: 'client' }
    });

    const res = await request(app)
      .get('/api/profile/1')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'jean@test.com');
  });

  test('❌ 401 - Accès sans token', async () => {
    const res = await request(app).get('/api/profile/1');
    expect(res.status).toBe(401);
  });

  test('❌ 403 - Un client ne peut pas voir le profil d\'un autre utilisateur', async () => {
    const res = await request(app)
      .get('/api/profile/99') // id différent du token (id=1)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/accès refusé/i);
  });

  test('✅ 200 - Un admin peut voir n\'importe quel profil', async () => {
    const adminToken = jwt.sign(
      { id: 10, email: 'admin@cinema.com', role: 'admin' },
      'secret_integration_test'
    );
    db.utilisateurs.findByPk.mockResolvedValue({
      id: 5, nom: 'Autre', prenom: 'User',
      email: 'autre@test.com', role: { nom: 'client' }
    });

    const res = await request(app)
      .get('/api/profile/5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

// =============================================================
// 4. PUT /api/profile/:id
// =============================================================
describe('PUT /api/profile/:id', () => {

  const validToken = jwt.sign(
    { id: 1, email: 'jean@test.com', role: 'client' },
    'secret_integration_test'
  );

  test('✅ 200 - Mise à jour du profil réussie', async () => {
    const mockUser = {
      id: 1, nom: 'Dupont',
      update: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({ id: 1, nom: 'NouveauNom' })
    };
    db.utilisateurs.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .put('/api/profile/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ nom: 'NouveauNom' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profil mis à jour');
  });

  test('❌ 401 - Sans token', async () => {
    const res = await request(app)
      .put('/api/profile/1')
      .send({ nom: 'Test' });

    expect(res.status).toBe(401);
  });

  test('❌ 403 - Un client ne peut pas modifier le rôle', async () => {
    const res = await request(app)
      .put('/api/profile/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ roleId: 3 }); // tentative d'escalade

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/administrateur/i);
  });

  test('❌ 403 - Un client ne peut pas modifier le profil d\'un autre', async () => {
    const res = await request(app)
      .put('/api/profile/99')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ nom: 'Hacker' });

    expect(res.status).toBe(403);
  });
});
