// __tests__/setup.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Close database connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
});
