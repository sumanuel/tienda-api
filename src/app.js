const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errors");

const createApp = () => {
  const app = express();

  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
    message: "Too many requests from this IP, please try again later.",
  });

  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(limiter);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      service: "tienda-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
