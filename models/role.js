const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define("roles", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING
  },

},
{
  tableName:"roles",
  timestamps:false
}
);

module.exports = Role;