const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },

    documentType: { type: DataTypes.STRING, allowNull: true },
    documentNumber: { type: DataTypes.STRING, allowNull: true },

    totalPurchases: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: "customers",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "name"] },
      { fields: ["organizationId", "documentNumber"] },
    ],
  }
);

module.exports = Customer;
