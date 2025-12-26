const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AccountReceivable = sequelize.define(
  "AccountReceivable",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    customerId: { type: DataTypes.UUID, allowNull: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    documentNumber: { type: DataTypes.STRING, allowNull: true },

    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    paidAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paidAt: { type: DataTypes.DATE, allowNull: true },

    baseCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "VES",
    },
    baseAmountUSD: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },
    exchangeRateAtCreation: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },

    description: { type: DataTypes.TEXT, allowNull: true },
    invoiceNumber: { type: DataTypes.STRING, allowNull: true },
    dueDate: { type: DataTypes.DATE, allowNull: true },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
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
    tableName: "accounts_receivable",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "status"] },
      { fields: ["organizationId", "dueDate"] },
    ],
  }
);

module.exports = AccountReceivable;
