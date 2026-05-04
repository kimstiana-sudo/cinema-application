const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Salle = sequelize.define("Salle", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'standard',
    allowNull: true,
  }
}, {
  tableName: "salles",
  timestamps: false
});

module.exports = Salle;