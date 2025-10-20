const morgan = require("morgan");

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const customLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

module.exports = { requestLogger, customLogger };
