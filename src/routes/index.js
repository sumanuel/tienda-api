const express = require("express");

const authRoutes = require("./auth.routes");
const productRoutes = require("./products.routes");
const orgRoutes = require("./org.routes");
const customerRoutes = require("./customers.routes");
const supplierRoutes = require("./suppliers.routes");
const salesRoutes = require("./sales.routes");
const exchangeRateRoutes = require("./exchangeRates.routes");
const settingsRoutes = require("./settings.routes");
const syncRoutes = require("./sync.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/org", orgRoutes);
router.use("/customers", customerRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/sales", salesRoutes);
router.use("/exchange-rates", exchangeRateRoutes);
router.use("/settings", settingsRoutes);
router.use("/sync", syncRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "tienda-api",
    routes: [
      "/auth",
      "/products",
      "/org",
      "/customers",
      "/suppliers",
      "/sales",
      "/exchange-rates",
      "/settings",
      "/sync",
    ],
  });
});

module.exports = router;
