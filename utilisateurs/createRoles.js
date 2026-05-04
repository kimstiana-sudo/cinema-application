const db = require("../models");

const createRoles = async () => {
  const roles = ["client", "agent", "admin"];

  for (const roleName of roles) {
    const existingRole = await db.roles.findOne({
      where: { nom: roleName },
    });

    if (!existingRole) {
      await db.roles.create({
        nom: roleName,
      });
    }
  }

  console.log("Rôles vérifiés");
};

module.exports = createRoles;