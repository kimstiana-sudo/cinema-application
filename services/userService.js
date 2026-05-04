const db = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

class UserService {
  async getAllUsers() {
    const users = await db.utilisateurs.findAll({
      include: [{ model: db.roles, as: 'role' }],
      attributes: { exclude: ['password'] }, // Ne pas retourner les mots de passe
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    return users;
  }

  async getUserById(id) {
    const user = await db.utilisateurs.findByPk(id, {
      include: [{ model: db.roles, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    return user;
  }

  async updateUser(id, updateData) {
    const user = await db.utilisateurs.findByPk(id);

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    // Si un nouveau mot de passe est fourni, le hasher
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Vérifier le rôle si changé
    if (updateData.roleId) {
      const role = await db.roles.findByPk(updateData.roleId);
      if (!role) {
        throw new Error("Rôle introuvable");
      }
    }

    await user.update(updateData);
    return await this.getUserById(id); // Retourner l'utilisateur mis à jour sans password
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);

    // Vérifier s'il a des réservations actives
    const reservationsActives = await db.reservations.findAll({
      where: {
        utilisateur_id: id,
        statut: { [Op.in]: ['CONFIRMEE', 'PAYEE'] }
      }
    });

    if (reservationsActives.length > 0) {
      throw new Error("Impossible de supprimer cet utilisateur car il a des réservations actives");
    }

    await user.destroy();
    return { message: "Utilisateur supprimé avec succès" };
  }

  async changeUserRole(userId, newRoleId) {
    const role = await db.roles.findByPk(newRoleId);
    if (!role) {
      throw new Error("Rôle introuvable");
    }

    const user = await db.utilisateurs.findByPk(userId);
    if (!user) {
      throw new Error("Utilisateur introuvable");
    }

    await user.update({ roleId: newRoleId });
    return await this.getUserById(userId);
  }

  async getUsersByRole(roleName) {
    const users = await db.utilisateurs.findAll({
      include: [{
        model: db.roles,
        as: 'role',
        where: { nom: roleName }
      }],
      attributes: { exclude: ['password'] },
      order: [['nom', 'ASC']]
    });

    return users;
  }

  async getUserStatistics() {
    const stats = await db.utilisateurs.findAll({
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total_users']
      ],
      include: [{
        model: db.roles,
        as: 'role',
        attributes: ['nom']
      }],
      group: ['role.nom']
    });

    return stats;
  }

  async searchUsers(searchTerm) {
    const users = await db.utilisateurs.findAll({
      where: {
        [Op.or]: [
          { nom: { [Op.like]: `%${searchTerm}%` } },
          { prenom: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } }
        ]
      },
      include: [{ model: db.roles, as: 'role' }],
      attributes: { exclude: ['password'] },
      limit: 20
    });

    return users;
  }
}

module.exports = new UserService();