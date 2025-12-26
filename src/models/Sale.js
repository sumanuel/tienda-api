const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    customerId: { type: DataTypes.UUID, allowNull: true },

    subtotal: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    discount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "VES" },
    exchangeRate: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },

    paymentMethod: { type: DataTypes.STRING, allowNull: true },
    paid: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    change: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "completed",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },

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
    tableName: "sales",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "createdAt"] },
    ],
  }
);

module.exports = Sale;
