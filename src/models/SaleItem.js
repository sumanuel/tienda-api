const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SaleItem = sequelize.define(
  "SaleItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: { type: DataTypes.UUID, allowNull: false },

    saleId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },

    productName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },

    price: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    priceUSD: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },
    subtotal: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
  },
  {
    tableName: "sale_items",
    indexes: [{ fields: ["organizationId"] }, { fields: ["saleId"] }],
  }
);

module.exports = SaleItem;
