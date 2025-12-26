const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Membership = sequelize.define(
  "Membership",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("owner", "admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
  },
  {
    tableName: "memberships",
  }
);

module.exports = Membership;
