const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan: {
      type: DataTypes.ENUM("free", "pro"),
      allowNull: false,
      defaultValue: "free",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "organizations",
  }
);

module.exports = Organization;
