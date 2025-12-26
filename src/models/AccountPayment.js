const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AccountPayment = sequelize.define(
  "AccountPayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    accountId: { type: DataTypes.UUID, allowNull: false },
    accountType: {
      type: DataTypes.ENUM("receivable", "payable"),
      allowNull: false,
    },

    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    paymentMethod: { type: DataTypes.STRING, allowNull: false },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    reference: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "account_payments",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["accountType", "accountId"] },
    ],
  }
);

module.exports = AccountPayment;
