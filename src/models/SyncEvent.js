const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SyncEvent = sequelize.define(
  "SyncEvent",
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
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sync_events",
    indexes: [
      { fields: ["organizationId"] },
      { unique: true, fields: ["organizationId", "eventId"] },
      { fields: ["organizationId", "receivedAt"] },
    ],
  }
);

module.exports = SyncEvent;
