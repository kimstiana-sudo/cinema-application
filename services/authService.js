const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

class AuthService {
  async registerUser(userData) {
    console.log('Register data received:', userData); // Debug

    // Validation des données
    if (!userData.nom || !userData.prenom || !userData.email || !userData.password) {
      throw new Error("Tous les champs sont requis");
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.utilisateurs.findOne({
      where: { email: userData.email }
    });
    if (existingUser) {
      throw new Error("Cet email existe déjà");
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Assigner systématiquement le rôle 'client' aux inscriptions publiques
    const clientRole = await db.roles.findOne({ where: { nom: 'client' } });
    if (!clientRole) {
      throw new Error("Le rôle client est introuvable");
    }

    if (userData.roleId && userData.roleId !== clientRole.id) {
      console.warn(`Tentative d'inscription avec rôle non client ignorée : ${userData.roleId}`);
    }

    // Créer l'utilisateur
    const user = await db.utilisateurs.create({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      password: hashedPassword,
      roleId: clientRole.id
    });

    return user;
  }

  async authenticateUser(email, password) {
    // Trouver l'utilisateur avec son rôle
    const user = await db.utilisateurs.findOne({
      where: { email },
      include: [{ model: db.roles, as: "role" }]
    });

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect");
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role.nom
      },
      process.env.JWT_SECRET
    );

    return { token, user };
  }

  async getProfile(userId) {
    const user = await db.utilisateurs.findByPk(userId, {
      include: [{ model: db.roles, as: "role" }]
    });

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await db.utilisateurs.findByPk(userId);

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    // Empêcher toute modification de rôle via le profil utilisateur
    if ('roleId' in updateData) {
      delete updateData.roleId;
    }

    // Si un nouveau mot de passe est fourni, le hasher
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);
    return user;
  }
}

module.exports = new AuthService();