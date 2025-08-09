/**
 * Standalone Security Input Validator
 * Tests input validation without requiring full server setup
 */

const fs = require('fs');
const path = require('path');

class SecurityInputValidator {
  constructor() {
    this.results = {
      totalTests: 0,
      vulnerabilities: [],
      warnings: []
    };
  }

  // Security payload generators
  getSQLInjectionPayloads() {
    return [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR 1=1 --",
      "admin'--",
      "' OR 1=1#"
    ];
  }

  getXSSPayloads() {
    return [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="javascript:alert(1)"></iframe>',
      'javascript:alert(1)',
      '<svg onload=alert(1)>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>'
    ];
  }

  getCommandInjectionPayloads() {
    return [
      '; ls -la',
      '&& cat /etc/passwd',
      '| whoami',
      '; rm -rf /',
      '`id`',
      '$(whoami)'
    ];
  }

  getPathTraversalPayloads() {
    return [
      '../../../etc/passwd',
      '..\\\\..\\\\..\\\\windows\\\\system32\\\\config\\\\SAM',
      '../../../../../../../../etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//etc/passwd'
    ];
  }

  // Test input validation functions
  testUsernameValidation(username) {
    const results = {
      input: username,
      vulnerabilities: []
    };

    // Check for SQL injection patterns
    if (this.getSQLInjectionPayloads().some(payload => username.includes(payload))) {
      results.vulnerabilities.push('SQL_INJECTION');
    }

    // Check for XSS patterns
    if (this.getXSSPayloads().some(payload => username.toLowerCase().includes(payload.toLowerCase()))) {
      results.vulnerabilities.push('XSS');
    }

    // Check for command injection
    if (this.getCommandInjectionPayloads().some(payload => username.includes(payload))) {
      results.vulnerabilities.push('COMMAND_INJECTION');
    }

    // Check for path traversal
    if (this.getPathTraversalPayloads().some(payload => username.includes(payload))) {
      results.vulnerabilities.push('PATH_TRAVERSAL');
    }

    // Check basic validation
    if (username.length < 3 || username.length > 20) {
      results.vulnerabilities.push('LENGTH_VALIDATION');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      results.vulnerabilities.push('CHARACTER_VALIDATION');
    }

    return results;
  }

  testPasswordValidation(password) {
    const results = {
      input: password,
      vulnerabilities: []
    };

    if (password.length < 8) {
      results.vulnerabilities.push('WEAK_PASSWORD_LENGTH');
    }

    if (!/\\d/.test(password)) {
      results.vulnerabilities.push('NO_NUMBERS');
    }

    if (!/[a-zA-Z]/.test(password)) {
      results.vulnerabilities.push('NO_LETTERS');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      results.warnings = results.warnings || [];
      results.warnings.push('NO_SPECIAL_CHARACTERS');
    }

    return results;
  }

  testThreadContentValidation(content) {
    const results = {
      input: content,
      vulnerabilities: []
    };

    // XSS detection
    if (/<script|javascript:|on\\w+\\s*=|<iframe|<object/i.test(content)) {
      results.vulnerabilities.push('XSS');
    }

    // SQL injection detection
    if (/'\\s*(or|and)\\s*'.*'\\s*=\\s*'|union\\s+select|drop\\s+table/i.test(content)) {
      results.vulnerabilities.push('SQL_INJECTION');
    }

    // Template injection
    if (/{{.*}}|\\$\\{.*\\}|<%.*%>/.test(content)) {
      results.vulnerabilities.push('TEMPLATE_INJECTION');
    }

    return results;
  }

  // Run comprehensive validation tests
  runSecurityValidation() {
    console.log('🔒 Running Security Input Validation Tests\\n');

    const testCases = [
      // Username tests
      ...this.getSQLInjectionPayloads().map(p => ({ type: 'username', value: p })),
      ...this.getXSSPayloads().map(p => ({ type: 'username', value: p })),
      
      // Password tests
      ['', 'a', '12', 'short', 'nouppercase123', 'NOLOWERCASE123', 'NoNumbers'],
      
      // Content tests
      ...this.getXSSPayloads().map(p => ({ type: 'content', value: p })),
      ...this.getSQLInjectionPayloads().map(p => ({ type: 'content', value: p }))
    ].flat();

    let totalVulnerabilities = 0;

    testCases.forEach((testCase, index) => {
      this.results.totalTests++;
      
      let result;
      switch (testCase.type) {
        case 'username':
          result = this.testUsernameValidation(testCase.value);
          break;
        case 'password':
          result = this.testPasswordValidation(testCase.value);
          break;
        case 'content':
          result = this.testThreadContentValidation(testCase.value);
          break;
        default:
          if (typeof testCase === 'string') {
            result = this.testPasswordValidation(testCase);
          }
      }

      if (result && result.vulnerabilities.length > 0) {
        totalVulnerabilities += result.vulnerabilities.length;
        this.results.vulnerabilities.push({
          testCase: index + 1,
          input: result.input.substring(0, 50) + (result.input.length > 50 ? '...' : ''),
          type: testCase.type || 'password',
          vulnerabilities: result.vulnerabilities
        });
      }

      if (result && result.warnings && result.warnings.length > 0) {
        this.results.warnings.push({
          testCase: index + 1,
          input: result.input.substring(0, 50),
          warnings: result.warnings
        });
      }
    });

    return this.generateSecurityReport(totalVulnerabilities);
  }

  generateSecurityReport(totalVulnerabilities) {
    console.log('📊 Security Validation Results');
    console.log('═'.repeat(50));
    console.log(`Total Tests Run: ${this.results.totalTests}`);
    console.log(`Total Vulnerabilities Found: ${totalVulnerabilities}`);
    console.log(`Vulnerability Rate: ${(totalVulnerabilities / this.results.totalTests * 100).toFixed(2)}%`);

    if (this.results.vulnerabilities.length > 0) {
      console.log('\\n🚨 Vulnerabilities Found:');
      console.log('-'.repeat(30));
      
      this.results.vulnerabilities.forEach(vuln => {
        console.log(`Test ${vuln.testCase} (${vuln.type}): ${vuln.input}`);
        console.log(`  Issues: ${vuln.vulnerabilities.join(', ')}`);
      });
    }

    if (this.results.warnings.length > 0) {
      console.log('\\n⚠️  Warnings:');
      console.log('-'.repeat(20));
      
      this.results.warnings.forEach(warning => {
        console.log(`Test ${warning.testCase}: ${warning.input}`);
        console.log(`  Warnings: ${warning.warnings.join(', ')}`);
      });
    }

    // Security recommendations
    console.log('\\n🛡️  Security Recommendations:');
    console.log('-'.repeat(35));
    
    const recommendations = [];
    
    if (this.results.vulnerabilities.some(v => v.vulnerabilities.includes('XSS'))) {
      recommendations.push('• Implement XSS protection: sanitize HTML inputs, use CSP headers');
    }
    
    if (this.results.vulnerabilities.some(v => v.vulnerabilities.includes('SQL_INJECTION'))) {
      recommendations.push('• Use parameterized queries, avoid string concatenation in DB queries');
    }
    
    if (this.results.vulnerabilities.some(v => v.vulnerabilities.includes('COMMAND_INJECTION'))) {
      recommendations.push('• Never execute user input as system commands, use allow-lists');
    }
    
    if (this.results.vulnerabilities.some(v => v.vulnerabilities.includes('WEAK_PASSWORD_LENGTH'))) {
      recommendations.push('• Enforce stronger password policies (min 8 chars, complexity)');
    }

    recommendations.forEach(rec => console.log(rec));

    if (totalVulnerabilities === 0) {
      console.log('\\n✅ No critical vulnerabilities found in input validation!');
    } else {
      console.log(`\\n❌ Found ${totalVulnerabilities} potential security issues that need attention.`);
    }

    return {
      totalTests: this.results.totalTests,
      vulnerabilities: totalVulnerabilities,
      passed: totalVulnerabilities === 0
    };
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new SecurityInputValidator();
  const results = validator.runSecurityValidation();
  process.exit(results.passed ? 0 : 1);
}

module.exports = SecurityInputValidator;
