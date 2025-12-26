const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AccountPayable = sequelize.define(
  "AccountPayable",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    supplierId: { type: DataTypes.UUID, allowNull: true },
    supplierName: { type: DataTypes.STRING, allowNull: false },

    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    paidAmount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paidAt: { type: DataTypes.DATE, allowNull: true },

    description: { type: DataTypes.TEXT, allowNull: true },
    dueDate: { type: DataTypes.DATE, allowNull: true },
    documentNumber: { type: DataTypes.STRING, allowNull: true },
    invoiceNumber: { type: DataTypes.STRING, allowNull: true },

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
    tableName: "accounts_payable",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "status"] },
      { fields: ["organizationId", "dueDate"] },
    ],
  }
);

module.exports = AccountPayable;
