/**
 * ============================================================
 * TESTS UNITAIRES - Module Authentification
 * ============================================================
 * Teste les fonctions de authService en isolation,
 * en mockant la base de données (aucune connexion réelle).
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Mock de la base de données ───────────────────────────────
jest.mock('../models', () => ({
  utilisateurs: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create:   jest.fn(),
  },
  roles: {
    findOne: jest.fn(),
  }
}));

const db      = require('../models');
const authService = require('../services/authService');

// ─── Setup global ─────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'secret_test_unitaire';
});

// =============================================================
// 1. INSCRIPTION (registerUser)
// =============================================================
describe('AuthService - registerUser', () => {

  test('✅ Inscription réussie avec données valides', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null); // email non existant
    db.roles.findOne.mockResolvedValue({ id: 1, nom: 'client' });
    db.utilisateurs.create.mockResolvedValue({
      id: 1, nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', roleId: 1
    });

    const result = await authService.registerUser({
      nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', password: 'motdepasse123'
    });

    expect(result).toHaveProperty('id', 1);
    expect(db.utilisateurs.create).toHaveBeenCalledTimes(1);
    // Le mot de passe stocké doit être hashé (différent de l'original)
    const createCall = db.utilisateurs.create.mock.calls[0][0];
    expect(createCall.password).not.toBe('motdepasse123');
  });

  test('❌ Inscription échoue si email déjà existant', async () => {
    db.utilisateurs.findOne.mockResolvedValue({ id: 99, email: 'jean@test.com' });

    await expect(authService.registerUser({
      nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', password: 'motdepasse123'
    })).rejects.toThrow('Cet email existe déjà');

    expect(db.utilisateurs.create).not.toHaveBeenCalled();
  });

  test('❌ Inscription échoue si champs manquants', async () => {
    await expect(authService.registerUser({
      nom: 'Dupont', email: 'jean@test.com', password: 'abc'
      // prenom manquant
    })).rejects.toThrow('Tous les champs sont requis');
  });

  test('❌ Inscription échoue si rôle client introuvable en BD', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);
    db.roles.findOne.mockResolvedValue(null); // rôle manquant

    await expect(authService.registerUser({
      nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', password: 'motdepasse123'
    })).rejects.toThrow('Le rôle client est introuvable');
  });

  test('✅ Le rôle est toujours forcé à "client" peu importe ce qu\'on envoie', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);
    db.roles.findOne.mockResolvedValue({ id: 1, nom: 'client' });
    db.utilisateurs.create.mockResolvedValue({ id: 1, roleId: 1 });

    await authService.registerUser({
      nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', password: 'motdepasse123',
      roleId: 3 // tentative d'escalade de privilège
    });

    const createCall = db.utilisateurs.create.mock.calls[0][0];
    expect(createCall.roleId).toBe(1); // toujours 1 (client)
  });

  test('✅ Le mot de passe est hashé avec bcrypt (salt >= 10)', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);
    db.roles.findOne.mockResolvedValue({ id: 1, nom: 'client' });
    db.utilisateurs.create.mockResolvedValue({ id: 1 });

    await authService.registerUser({
      nom: 'Test', prenom: 'User',
      email: 'test@test.com', password: 'monmotdepasse'
    });

    const createCall = db.utilisateurs.create.mock.calls[0][0];
    const isHashed = await bcrypt.compare('monmotdepasse', createCall.password);
    expect(isHashed).toBe(true);
  });
});

// =============================================================
// 2. CONNEXION (authenticateUser)
// =============================================================
describe('AuthService - authenticateUser', () => {

  test('✅ Connexion réussie avec bons identifiants', async () => {
    const hashedPw = await bcrypt.hash('secret123', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 1, email: 'jean@test.com', password: hashedPw,
      nom: 'Dupont', prenom: 'Jean',
      role: { id: 1, nom: 'client' }
    });

    const result = await authService.authenticateUser('jean@test.com', 'secret123');

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    // Vérifier que le token est un JWT valide
    const decoded = jwt.verify(result.token, 'secret_test_unitaire');
    expect(decoded).toHaveProperty('email', 'jean@test.com');
    expect(decoded).toHaveProperty('role', 'client');
  });

  test('❌ Connexion échoue si utilisateur introuvable', async () => {
    db.utilisateurs.findOne.mockResolvedValue(null);

    await expect(authService.authenticateUser('inexistant@test.com', 'secret'))
      .rejects.toThrow('Utilisateur introuvable');
  });

  test('❌ Connexion échoue avec mauvais mot de passe', async () => {
    const hashedPw = await bcrypt.hash('bonmotdepasse', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 1, email: 'jean@test.com', password: hashedPw,
      role: { id: 1, nom: 'client' }
    });

    await expect(authService.authenticateUser('jean@test.com', 'mauvais'))
      .rejects.toThrow('Mot de passe incorrect');
  });

  test('✅ Le token JWT contient bien id, email et rôle', async () => {
    const hashedPw = await bcrypt.hash('pass123', 10);
    db.utilisateurs.findOne.mockResolvedValue({
      id: 42, email: 'agent@test.com', password: hashedPw,
      nom: 'Martin', prenom: 'Luc',
      role: { id: 2, nom: 'agent' }
    });

    const { token } = await authService.authenticateUser('agent@test.com', 'pass123');
    const decoded = jwt.verify(token, 'secret_test_unitaire');

    expect(decoded.id).toBe(42);
    expect(decoded.email).toBe('agent@test.com');
    expect(decoded.role).toBe('agent');
  });
});

// =============================================================
// 3. PROFIL (getProfile / updateProfile)
// =============================================================
describe('AuthService - getProfile', () => {

  test('✅ Retourne le profil d\'un utilisateur existant', async () => {
    db.utilisateurs.findByPk.mockResolvedValue({
      id: 1, nom: 'Dupont', prenom: 'Jean',
      email: 'jean@test.com', role: { nom: 'client' }
    });

    const result = await authService.getProfile(1);
    expect(result).toHaveProperty('email', 'jean@test.com');
  });

  test('❌ Lève une erreur si utilisateur inexistant', async () => {
    db.utilisateurs.findByPk.mockResolvedValue(null);

    await expect(authService.getProfile(999))
      .rejects.toThrow('Utilisateur introuvable');
  });
});

describe('AuthService - updateProfile', () => {

  test('✅ Mise à jour du nom réussie', async () => {
    const mockUser = {
      id: 1, nom: 'Ancien', prenom: 'Prenom',
      update: jest.fn().mockResolvedValue(true)
    };
    db.utilisateurs.findByPk.mockResolvedValue(mockUser);

    await authService.updateProfile(1, { nom: 'Nouveau' });
    expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({ nom: 'Nouveau' }));
  });

  test('✅ Le mot de passe est re-hashé lors de la mise à jour', async () => {
    const mockUser = {
      id: 1,
      update: jest.fn().mockResolvedValue(true)
    };
    db.utilisateurs.findByPk.mockResolvedValue(mockUser);

    await authService.updateProfile(1, { password: 'nouveauMotDePasse' });

    const updateCall = mockUser.update.mock.calls[0][0];
    expect(updateCall.password).not.toBe('nouveauMotDePasse');
    const isHashed = await bcrypt.compare('nouveauMotDePasse', updateCall.password);
    expect(isHashed).toBe(true);
  });

  test('❌ Mise à jour échoue si utilisateur inexistant', async () => {
    db.utilisateurs.findByPk.mockResolvedValue(null);

    await expect(authService.updateProfile(999, { nom: 'Test' }))
      .rejects.toThrow('Utilisateur introuvable');
  });
});

// =============================================================
// 4. MIDDLEWARE verifyToken
// =============================================================
describe('Middleware - verifyToken', () => {
  const verifyToken = require('../middlewares/authMiddleware');

  test('✅ Token valide laisse passer la requête', () => {
    const token = jwt.sign({ id: 1, role: 'client' }, 'secret_test_unitaire');
    const req  = { headers: { authorization: `Bearer ${token}` } };
    const res  = {};
    const next = jest.fn();

    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toHaveProperty('id', 1);
  });

  test('❌ Requête sans token retourne 401', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('❌ Token invalide retourne 401', () => {
    const req  = { headers: { authorization: 'Bearer tokenbidon123' } };
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
