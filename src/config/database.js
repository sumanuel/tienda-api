const path = require("path");
const { Sequelize } = require("sequelize");

const dialect = (process.env.DB_DIALECT || "postgres").toLowerCase();
const schema =
  dialect === "postgres" ? process.env.DB_SCHEMA || "tienda_api" : undefined;

const buildSequelize = () => {
  if (dialect === "sqlite") {
    const storage = process.env.DB_STORAGE || "./dev.sqlite";
    return new Sequelize({
      dialect: "sqlite",
      storage: path.resolve(process.cwd(), storage),
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    });
  }

  if (dialect === "postgres") {
    return new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        define: schema ? { schema } : undefined,
        searchPath: schema,
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }

  throw new Error(`Unsupported DB_DIALECT: ${dialect}`);
};

const sequelize = buildSequelize();

const testConnection = async () => {
  await sequelize.authenticate();
  console.log("✅ Database connection established.");
};

module.exports = {
  sequelize,
  testConnection,
  dbDialect: dialect,
  dbSchema: schema,
};
