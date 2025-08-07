# Fuzz Testing Guide for Nurtura Backend

## Overview

This guide provides comprehensive fuzz testing for your MERN stack backend to find vulnerabilities, edge cases, and potential crashes.

## What is Fuzz Testing?

Fuzz testing involves providing invalid, unexpected, or random data as inputs to your application to find bugs and security vulnerabilities.

## Test Types Implemented

### 1. 🔒 Security Fuzz Tests (`security-fuzz.test.js`)

Tests for common security vulnerabilities:

- **SQL Injection**: Tests malicious SQL payloads
- **NoSQL Injection**: Tests MongoDB-specific injection attempts
- **XSS (Cross-Site Scripting)**: Tests script injection attempts
- **Command Injection**: Tests OS command execution attempts
- **Path Traversal**: Tests directory traversal attacks
- **Authentication Bypass**: Tests JWT and auth bypasses
- **LDAP Injection**: Tests LDAP query manipulation
- **XXE (XML External Entity)**: Tests XML-based attacks
- **SSTI (Server-Side Template Injection)**: Tests template injection
- **Header Injection**: Tests HTTP header manipulation

### 2. 📋 Property-Based Tests (`property-based-fuzz.test.js`)

Tests business logic invariants:

- **Username Validation**: Ensures consistent username rules
- **Password Strength**: Validates password requirements
- **Event Creation**: Tests event validation logic
- **Data Sanitization**: Ensures XSS content is properly handled
- **Thread Voting**: Tests voting consistency
- **Vital Signs**: Validates medical data ranges
- **Input Validation**: Tests all input validation rules

### 3. 🌐 API Endpoint Fuzzer (`api-fuzzer.js`)

Tests all API endpoints with random data:

- Generates random payloads for all endpoint types
- Tests with malformed JSON, large payloads, special characters
- Includes XSS, injection, and Unicode test cases
- Monitors response times and error rates
- Generates comprehensive test reports

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install --save-dev fast-check faker
```

### 2. Run Individual Test Types

```bash
# Security tests
npm run fuzz:security

# Property-based tests
npm run fuzz:property

# API endpoint fuzzer
npm run fuzz:api

# All tests
npm run fuzz:all
```

### 3. Run Tests with Coverage

```bash
npm run test:coverage -- --testPathPattern=fuzz
```

## Test Configuration

### Environment Variables

Create a `.env.test` file for testing:

```env
NODE_ENV=test
MONGO_URI=mongodb://localhost:27017/nurtura_test
JWT_SECRET=test_secret_key_for_fuzzing
```

### Jest Configuration (`jest.fuzz.config.js`)

- Extended timeouts for fuzz tests
- Coverage reporting
- Proper test environment setup

## Understanding Test Results

### Security Test Results

- ✅ **PASS**: Vulnerability properly blocked
- ❌ **FAIL**: Security vulnerability found
- ⚠️ **WARNING**: Suspicious behavior detected

### Property Test Results

- Shows how many test cases were generated
- Displays any invariant violations
- Reports edge cases that break expected behavior

### API Fuzzer Results

```
📊 Fuzz Testing Results:
Total Requests: 1250
Total Crashes: 3
Crash Rate: 0.24%
Unique Errors: 2
Status Codes: { '200': 800, '400': 400, '401': 45, '500': 5 }
Avg Response Time: 45.2ms
```

## Common Vulnerabilities to Look For

### 1. **500 Internal Server Error**

- Indicates unhandled exceptions
- Could lead to information disclosure
- May cause service disruption

### 2. **Inconsistent Validation**

- Different error messages for same input type
- Some endpoints accept invalid data others reject
- Bypassing validation logic

### 3. **Authentication Issues**

- Endpoints accessible without proper auth
- JWT token manipulation succeeding
- Role elevation possible

### 4. **Injection Vulnerabilities**

- Database queries executing malicious code
- OS commands being executed
- Template engines evaluating user input

### 5. **Memory/Performance Issues**

- Excessive memory usage with large payloads
- Long response times indicating DoS potential
- Resource exhaustion vulnerabilities

## Fixing Common Issues

### Database Connection Issues

```javascript
// Ensure proper test database setup
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
```

### Authentication Setup

```javascript
// Create test users properly
const testUser = await User.create({
  username: "testuser",
  passwordHash: await bcrypt.hash("TestPass123!", 10),
});
```

### Error Handling

```javascript
// Wrap endpoints in try-catch
app.post("/api/endpoint", async (req, res) => {
  try {
    // Your logic here
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
```

## Custom Fuzz Tests

### Adding New Test Cases

1. **Create test file**: `tests/fuzz/custom-fuzz.test.js`
2. **Import dependencies**: `supertest`, `fast-check`, etc.
3. **Write property-based tests**:

```javascript
const fc = require("fast-check");

test("Custom business logic test", () => {
  fc.assert(
    fc.property(
      fc.string(), // Generate random strings
      async (input) => {
        const response = await request(app)
          .post("/api/custom")
          .send({ data: input });

        // Assert your business rules
        expect(response.status).not.toBe(500);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Fuzz Tests
on: [push, pull_request]
jobs:
  fuzz-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: cd server && npm ci
      - name: Run fuzz tests
        run: cd server && npm run fuzz:all
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Performance Monitoring

### Adding Performance Metrics

```javascript
const startTime = process.hrtime();
// ... make request ...
const [seconds, nanoseconds] = process.hrtime(startTime);
const responseTime = seconds * 1000 + nanoseconds / 1000000;

if (responseTime > 1000) {
  console.warn(`Slow response: ${responseTime}ms`);
}
```

## Best Practices

1. **Run Regularly**: Include fuzz tests in CI/CD pipeline
2. **Monitor Logs**: Check application logs during fuzzing
3. **Test in Isolation**: Use separate test database
4. **Document Findings**: Keep track of discovered issues
5. **Fix Promptly**: Address security vulnerabilities immediately
6. **Increase Coverage**: Add tests for new endpoints
7. **Use Realistic Data**: Include domain-specific test cases

## Troubleshooting

### Common Issues:

1. **MongoDB Connection**: Ensure test database is available
2. **Port Conflicts**: Use different ports for testing
3. **Timeout Errors**: Increase Jest timeout for long-running tests
4. **Memory Issues**: Monitor memory usage during intensive fuzzing

### Debug Mode:

```bash
DEBUG=* npm run fuzz:security
```

## Security Recommendations

Based on fuzz testing results:

1. **Input Validation**: Validate and sanitize all user inputs
2. **Error Handling**: Don't expose stack traces to users
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Authentication**: Use strong JWT secrets and proper expiration
5. **Logging**: Log security events for monitoring
6. **Updates**: Keep dependencies updated

## Next Steps

1. Run the initial fuzz test suite
2. Analyze and fix any discovered vulnerabilities
3. Add custom tests for your specific business logic
4. Integrate into your development workflow
5. Monitor and maintain test coverage

Remember: Fuzz testing is an ongoing process. Regular testing helps catch new vulnerabilities as your application evolves.
