const Organization = require("./Organization");
const User = require("./User");
const Membership = require("./Membership");
const Product = require("./Product");
const Customer = require("./Customer");
const Supplier = require("./Supplier");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const AccountReceivable = require("./AccountReceivable");
const AccountPayable = require("./AccountPayable");
const AccountPayment = require("./AccountPayment");
const ExchangeRate = require("./ExchangeRate");
const Setting = require("./Setting");
const SyncEvent = require("./SyncEvent");
const InventoryMovement = require("./InventoryMovement");

// Associations
Organization.hasMany(Membership, {
  foreignKey: "organizationId",
  as: "memberships",
});
Membership.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

User.hasMany(Membership, { foreignKey: "userId", as: "memberships" });
Membership.belongsTo(User, { foreignKey: "userId", as: "user" });

Organization.hasMany(Product, { foreignKey: "organizationId", as: "products" });
Product.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(Customer, {
  foreignKey: "organizationId",
  as: "customers",
});
Customer.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(Supplier, {
  foreignKey: "organizationId",
  as: "suppliers",
});
Supplier.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(Sale, { foreignKey: "organizationId", as: "sales" });
Sale.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Sale.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(Sale, { foreignKey: "customerId", as: "sales" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

SaleItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(SaleItem, { foreignKey: "productId", as: "saleItems" });

Organization.hasMany(AccountReceivable, {
  foreignKey: "organizationId",
  as: "accountsReceivable",
});
AccountReceivable.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
AccountReceivable.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});
Customer.hasMany(AccountReceivable, {
  foreignKey: "customerId",
  as: "accountsReceivable",
});

Organization.hasMany(AccountPayable, {
  foreignKey: "organizationId",
  as: "accountsPayable",
});
AccountPayable.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
AccountPayable.belongsTo(Supplier, {
  foreignKey: "supplierId",
  as: "supplier",
});
Supplier.hasMany(AccountPayable, {
  foreignKey: "supplierId",
  as: "accountsPayable",
});

Organization.hasMany(AccountPayment, {
  foreignKey: "organizationId",
  as: "accountPayments",
});
AccountPayment.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(ExchangeRate, {
  foreignKey: "organizationId",
  as: "exchangeRates",
});
ExchangeRate.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(Setting, { foreignKey: "organizationId", as: "settings" });
Setting.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(SyncEvent, {
  foreignKey: "organizationId",
  as: "syncEvents",
});
SyncEvent.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

Organization.hasMany(InventoryMovement, {
  foreignKey: "organizationId",
  as: "inventoryMovements",
});
InventoryMovement.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});

InventoryMovement.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});
Product.hasMany(InventoryMovement, {
  foreignKey: "productId",
  as: "inventoryMovements",
});

module.exports = {
  Organization,
  User,
  Membership,
  Product,
  Customer,
  Supplier,
  Sale,
  SaleItem,
  AccountReceivable,
  AccountPayable,
  AccountPayment,
  ExchangeRate,
  Setting,
  SyncEvent,
  InventoryMovement,
};
