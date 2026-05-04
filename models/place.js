const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Place = sequelize.define("places", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numero: {
    type: DataTypes.STRING, // ex: "A1", "B5", etc.
    allowNull: false,
  },
  rang: {
    type: DataTypes.STRING, // ex: "A", "B", "C"
    allowNull: false,
  },
  salle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "salles",
      key: "id"
    }
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: "places",
  timestamps: false
});

module.exports = Place;