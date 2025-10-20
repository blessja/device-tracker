const express = require("express");
const cors = require("cors");
const { requestLogger, customLogger } = require("./middlewares/logger");
const { errorHandler } = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(requestLogger);
app.use(customLogger);

// Routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
