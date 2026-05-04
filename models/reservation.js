const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Reservation = sequelize.define("reservations", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombrePlace: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('CONFIRMEE', 'PAYEE', 'ANNULEE'),
    defaultValue: 'CONFIRMEE'
  },
  date_reservation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
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
  tableName: "reservations",
  timestamps: false
});

module.exports = Reservation;