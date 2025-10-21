const morgan = require("morgan");

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    skip: () => process.env.NODE_ENV === "test",
  }
);

const customLogger = (req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
};

module.exports = { requestLogger, customLogger };
