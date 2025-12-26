const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Supplier = sequelize.define(
  "Supplier",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    documentNumber: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    contactPerson: { type: DataTypes.STRING, allowNull: true },
    paymentTerms: { type: DataTypes.STRING, allowNull: true },

    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: "suppliers",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "name"] },
      { unique: true, fields: ["organizationId", "documentNumber"] },
    ],
  }
);

module.exports = Supplier;
