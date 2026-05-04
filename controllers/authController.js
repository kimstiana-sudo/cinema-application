const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body); // Debug
    const { nom, prenom, email, password } = req.body;

    const user = await authService.registerUser({ nom, prenom, email, password });

    res.status(201).json({
      message: "Compte créé avec succès",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await authService.authenticateUser(email, password);

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.id);
    const requesterId = req.user.id;

    if (requesterId !== requestedUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const user = await authService.getProfile(requestedUserId);

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const requestedUserId = Number(req.params.id);
    const requesterId = req.user.id;
    const updateData = req.body;

    if (requesterId !== requestedUserId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (updateData.roleId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Seul un administrateur peut modifier le rôle" });
    }

    const user = await authService.updateProfile(requestedUserId, updateData);

    res.status(200).json({
      message: "Profil mis à jour",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};