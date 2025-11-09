// Mock axios to prevent real HTTP requests in tests
module.exports = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function() {
    return this;
  }),
  defaults: {
    adapter: {}
  }
};
