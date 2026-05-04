const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Billet = sequelize.define("billets", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code_billet: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  date_generation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reservation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "reservations",
      key: "id"
    }
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "utilisateurs",
      key: "id"
    }
  },
  seance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "seances",
      key: "id"
    }
  }
}, {
  tableName: "billets",
  timestamps: false
});

module.exports = Billet;