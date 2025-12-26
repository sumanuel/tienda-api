const http = require("http");

const { createApp } = require("./app");
const {
  sequelize,
  testConnection,
  dbDialect,
  dbSchema,
} = require("./config/database");

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  const app = createApp();

  try {
    console.log("Starting server initialization...");

    console.log("Testing database connection...");
    await testConnection();

    if (dbDialect === "postgres" && dbSchema) {
      console.log(`Ensuring schema exists: ${dbSchema} ...`);
      try {
        await sequelize.createSchema(dbSchema);
      } catch (e) {
        // ignore if already exists
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Synchronizing database (development)...");
      await sequelize.sync({ alter: true });
      console.log("✅ Database synchronized successfully.");
    }

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 tienda-api running on port ${PORT}`);
      console.log(`✅ Health: http://localhost:${PORT}/health`);
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

module.exports = { startServer };
