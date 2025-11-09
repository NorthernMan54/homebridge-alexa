// Global setup for all tests

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging test failures
    error: console.error,
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';

// Prevent any real network calls by default
const net = require('net');
const originalConnect = net.connect;
net.connect = function(...args) {
  throw new Error('Network calls are not allowed in tests. Please mock this call.');
};

// Restore original for cleanup
afterAll(() => {
  net.connect = originalConnect;
});
