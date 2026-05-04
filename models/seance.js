const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Seance = sequelize.define("seances", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dateHeure: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  prix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  film_id:{
    type: DataTypes.INTEGER,
    allowNull:false
  },
  salle_id: {
  type: DataTypes.INTEGER,
  allowNull: false
}
  
}, {
  tableName: "seances",
  timestamps: false
});

module.exports = Seance;