# Testing Guide

## Running Tests Locally

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

## Continuous Integration

Tests run automatically on:
- Push to main/master/beta branches
- Pull requests to main/master/beta branches

The CI pipeline:
1. Tests against Node.js 18.x, 20.x, and 22.x
2. Runs ESLint checks
3. Runs Jest test suite with coverage
4. Uploads coverage reports to Codecov (optional)

## Test Structure

- Unit tests: `src/**/*.test.js`
- Test configuration: `jest.config.js`
- CI configuration: `.github/workflows/test.yml`

## Writing Tests

Tests use Jest framework. Example:

```javascript
describe('MyComponent', () => {
  test('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Coverage Thresholds

Current coverage thresholds (defined in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Troubleshooting

### Tests Fail Locally But Pass in CI
- Ensure you're using the correct Node.js version
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Coverage Reports Not Generated
- Ensure you're running: `npm run test:coverage`
- Check that `jest.config.js` has correct coverage settings
