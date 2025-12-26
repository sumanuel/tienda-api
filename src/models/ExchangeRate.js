const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ExchangeRate = sequelize.define(
  "ExchangeRate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    source: { type: DataTypes.STRING, allowNull: false },
    rate: { type: DataTypes.DECIMAL(18, 6), allowNull: false },
    fromCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USD",
    },
    toCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "VES",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "exchange_rates",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "isActive"] },
    ],
  }
);

module.exports = ExchangeRate;
