const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const InventoryMovement = sequelize.define(
  "InventoryMovement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantityDelta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "inventory_movements",
    indexes: [
      { fields: ["organizationId"] },
      { fields: ["organizationId", "productId"] },
      { fields: ["sourceId"] },
      { fields: ["eventId"] },
    ],
  }
);

module.exports = InventoryMovement;
