const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        message: "ID du rôle requis",
      });
    }

    const user = await userService.changeUserRole(req.params.id, roleId);

    res.status(200).json({
      message: "Rôle de l'utilisateur changé avec succès",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const { roleName } = req.params;

    const users = await userService.getUsersByRole(roleName);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
    });
  }
};

const getUserStatistics = async (req, res) => {
  try {
    const stats = await userService.getUserStatistics();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Terme de recherche requis (paramètre q)",
      });
    }

    const users = await userService.searchUsers(q);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la recherche",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  getUsersByRole,
  getUserStatistics,
  searchUsers,
};