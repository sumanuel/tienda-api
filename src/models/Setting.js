const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    key: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "settings",
    indexes: [{ unique: true, fields: ["organizationId", "key"] }],
  }
);

module.exports = Setting;
