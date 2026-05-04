const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Paiement = sequelize.define("paiements", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  montant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  methode: {
    type: DataTypes.STRING, // "carte", "paypal", etc.
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'paye', 'annule', 'rembourse'),
    defaultValue: 'en_attente',
  },
  date_paiement: {
    type: DataTypes.DATE,
    allowNull: true,
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
  }
}, {
  tableName: "paiements",
  timestamps: false
});

module.exports = Paiement;