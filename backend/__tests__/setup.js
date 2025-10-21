// __tests__/setup.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Connect to test database before all tests
beforeAll(async () => {
  const MONGODB_URI =
    process.env.MONGODB_TEST_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/device_tracker_test";

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Failed to connect to test database:", error);
    process.exit(1);
  }
}, 30000);

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);
