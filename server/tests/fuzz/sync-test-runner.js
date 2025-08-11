/**
 * Synchronous Test Runner for Individual Fuzz Tests
 * Runs each test type one at a time with detailed output
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class SyncTestRunner {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
  }

  async runTest(testName, testFile, isJestTest = true) {
    console.log(`\n🧪 Running ${testName}...`);
    console.log(`📁 File: ${testFile}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();
    
    try {
      if (isJestTest) {
        await this.runJestTest(testFile);
      } else {
        await this.runNodeScript(testFile);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} completed in ${duration}ms`);
      this.results.passed++;
      this.results.details.push({
        name: testName,
        status: 'PASSED',
        duration: duration,
        file: testFile
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${testName} failed: ${error.message}`);
      this.results.failed++;
      this.results.details.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        file: testFile,
        error: error.message
      });
    }
    
    this.results.totalTests++;
  }

  async runJestTest(testFile) {
    return new Promise((resolve, reject) => {
      const jestArgs = [
        'jest',
        testFile,
        '--verbose',
        '--no-coverage',
        '--detectOpenHandles',
        '--forceExit',
        '--testTimeout=30000'
      ];

      console.log(`🔧 Command: npx ${jestArgs.join(' ')}`);
      
      const jestProcess = spawn('npx', jestArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        shell: true,
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';
      let hasOutput = false;

      // Set a timeout for the Jest process
      const timeout = setTimeout(() => {
        if (jestProcess && !jestProcess.killed) {
          jestProcess.kill('SIGTERM');
        }
        reject(new Error('Test timed out after 45 seconds'));
      }, 45000);

      jestProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        hasOutput = true;
        // Print real-time output
        process.stdout.write(output);
      });

      jestProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        hasOutput = true;
        // Print real-time error output
        process.stderr.write(output);
      });

      jestProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        if (!hasOutput) {
          console.log('⚠️  No output received from Jest process');
        }
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Jest exited with code ${code}\nStderr: ${stderr}`));
        }
      });

      jestProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Jest process error: ${error.message}`));
      });
    });
  }

  async runNodeScript(scriptFile) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Command: node ${scriptFile}`);
      
      const nodeProcess = spawn('node', [scriptFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        shell: true,
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';

      // Set a timeout
      const timeout = setTimeout(() => {
        if (nodeProcess && !nodeProcess.killed) {
          nodeProcess.kill('SIGTERM');
        }
        reject(new Error('Script timed out after 30 seconds'));
      }, 30000);

      nodeProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Print real-time output
        process.stdout.write(output);
      });

      nodeProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        // Print real-time error output  
        process.stderr.write(output);
      });

      nodeProcess.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Node script exited with code ${code}\nStderr: ${stderr}`));
        }
      });

      nodeProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Node process error: ${error.message}`));
      });
    });
  }

  async runAllTestsSynchronously() {
    console.log('🚀 Starting Synchronous Fuzz Test Execution...');
    console.log('🔄 Running each test individually with detailed output\n');

    // 1. Property-Based Fuzz Tests
    await this.runTest(
      'Property-Based Fuzz Tests', 
      'tests/fuzz/property-based-fuzz.test.js',
      true
    );

    // 2. Security Fuzz Tests  
    await this.runTest(
      'Security Fuzz Tests',
      'tests/fuzz/security-fuzz.test.js', 
      true
    );

    // 3. Basic Fuzz Tests
    await this.runTest(
      'Basic Fuzz Tests',
      'tests/fuzz/basic-fuzz.test.js',
      true
    );

    // 4. API Fuzzer (Node script)
    await this.runTest(
      'API Fuzzer',
      'tests/fuzz/api-fuzzer.js',
      false
    );

    // 5. Fast API Fuzzer (Node script) 
    await this.runTest(
      'Fast API Fuzzer',
      'tests/fuzz/fast-api-fuzzer.js',
      false
    );

    // 6. Quick Security Test (Node script)
    await this.runTest(
      'Quick Security Test', 
      'tests/fuzz/quick-security-test.js',
      false
    );

    // 7. Security Input Validator (Node script)
    await this.runTest(
      'Security Input Validator',
      'tests/fuzz/security-input-validator.js', 
      false
    );

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 SYNCHRONOUS FUZZ TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`📈 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    
    const successRate = this.results.totalTests > 0 
      ? ((this.results.passed / this.results.totalTests) * 100).toFixed(1)
      : '0.0';
    console.log(`📊 Success Rate: ${successRate}%`);

    if (this.results.details.length > 0) {
      console.log('\n📋 Detailed Results:');
      console.log('-'.repeat(80));
      
      this.results.details.forEach((detail, index) => {
        const status = detail.status === 'PASSED' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${detail.name} (${detail.duration}ms)`);
        if (detail.error) {
          console.log(`   Error: ${detail.error}`);
        }
        console.log(`   File: ${detail.file}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    
    if (this.results.failed > 0) {
      console.log('❌ Some tests failed. Check the detailed output above.');
      process.exit(1);
    } else {
      console.log('🎉 All tests completed successfully!');
      process.exit(0);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new SyncTestRunner();
  runner.runAllTestsSynchronously().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = SyncTestRunner;
