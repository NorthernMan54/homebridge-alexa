module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tools/',
    'plugin.notest.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/*.notest.js',
    '!**/node_modules/**',
    '!**/tools/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  modulePathIgnorePatterns: [],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Ensure tests don't make real network calls
  testTimeout: 10000,
  // Mock file system and network modules by default
  moduleNameMapper: {
    '^axios$': '<rootDir>/src/__mocks__/axios.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
