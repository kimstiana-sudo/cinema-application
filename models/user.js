const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("utilisateurs", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  max_reservations: {
    type: DataTypes.INTEGER,
    defaultValue: 5, // default 5 reservations
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references:{
      model:"roles",
      key:"id"
    }

  }
},
{
  tableName:"utilisateurs",
  timestamps:false
}
);

module.exports = User;