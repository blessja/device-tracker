module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/config/**", "!src/utils/**"],
  verbose: true,
  testTimeout: 30000, // Increase timeout to 30 seconds
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
};
