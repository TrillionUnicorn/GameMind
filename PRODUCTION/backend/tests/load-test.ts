/**
 * Load Testing Script
 * Test backend performance under load
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '100');
const DURATION_SECONDS = parseInt(process.env.DURATION_SECONDS || '60');

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}

class LoadTester {
  private results: Map<string, number[]> = new Map();
  private errors: Map<string, number> = new Map();
  private startTime: number = 0;

  async runTest(endpoint: string, method: string = 'GET', body?: any) {
    const start = Date.now();
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - start;

      if (!this.results.has(endpoint)) {
        this.results.set(endpoint, []);
        this.errors.set(endpoint, 0);
      }

      if (response.ok) {
        this.results.get(endpoint)!.push(duration);
      } else {
        this.errors.set(endpoint, (this.errors.get(endpoint) || 0) + 1);
      }
    } catch (error) {
      this.errors.set(endpoint, (this.errors.get(endpoint) || 0) + 1);
    }
  }

  async runConcurrentTests(endpoint: string, count: number, method: string = 'GET', body?: any) {
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.runTest(endpoint, method, body));
    }
    await Promise.all(promises);
  }

  getResults(endpoint: string): TestResult {
    const durations = this.results.get(endpoint) || [];
    const errors = this.errors.get(endpoint) || 0;
    const totalRequests = durations.length + errors;
    const totalDuration = (Date.now() - this.startTime) / 1000;

    return {
      endpoint,
      totalRequests,
      successfulRequests: durations.length,
      failedRequests: errors,
      averageResponseTime: durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0,
      minResponseTime: durations.length > 0 ? Math.min(...durations) : 0,
      maxResponseTime: durations.length > 0 ? Math.max(...durations) : 0,
      requestsPerSecond: totalRequests / totalDuration,
    };
  }

  printResults(endpoint: string) {
    const result = this.getResults(endpoint);
    
    console.log(`\n📊 Results for ${endpoint}:`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`   Failed: ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`   Average Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${result.minResponseTime}ms`);
    console.log(`   Max Response Time: ${result.maxResponseTime}ms`);
    console.log(`   Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
  }

  reset() {
    this.results.clear();
    this.errors.clear();
    this.startTime = Date.now();
  }
}

async function main() {
  console.log('🚀 Starting Load Test');
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   Duration: ${DURATION_SECONDS}s`);
  console.log('');

  const tester = new LoadTester();

  // Test 1: Health Check
  console.log('📝 Test 1: Health Check Endpoint');
  tester.reset();
  await tester.runConcurrentTests('/health', CONCURRENT_USERS);
  tester.printResults('/health');

  // Test 2: Detailed Health Check
  console.log('\n📝 Test 2: Detailed Health Check');
  tester.reset();
  await tester.runConcurrentTests('/health/detailed', CONCURRENT_USERS);
  tester.printResults('/health/detailed');

  // Test 3: Metrics Endpoint
  console.log('\n📝 Test 3: Metrics Endpoint');
  tester.reset();
  await tester.runConcurrentTests('/health/metrics', CONCURRENT_USERS);
  tester.printResults('/health/metrics');

  // Test 4: Sustained Load
  console.log('\n📝 Test 4: Sustained Load Test');
  console.log(`   Running for ${DURATION_SECONDS} seconds...`);
  tester.reset();
  
  const endTime = Date.now() + (DURATION_SECONDS * 1000);
  let requestCount = 0;

  while (Date.now() < endTime) {
    await tester.runConcurrentTests('/health', 10);
    requestCount += 10;
    
    // Progress indicator
    if (requestCount % 100 === 0) {
      process.stdout.write('.');
    }
  }
  
  console.log('\n');
  tester.printResults('/health');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 LOAD TEST SUMMARY');
  console.log('='.repeat(60));
  
  const healthResult = tester.getResults('/health');
  const successRate = (healthResult.successfulRequests / healthResult.totalRequests) * 100;
  
  console.log(`\n✅ Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`⚡ Average Response Time: ${healthResult.averageResponseTime.toFixed(2)}ms`);
  console.log(`🚀 Requests/Second: ${healthResult.requestsPerSecond.toFixed(2)}`);
  
  if (successRate >= 99 && healthResult.averageResponseTime < 100) {
    console.log('\n🎉 PASS: System performing well under load!');
  } else if (successRate >= 95 && healthResult.averageResponseTime < 200) {
    console.log('\n⚠️  WARNING: System performance acceptable but could be improved');
  } else {
    console.log('\n❌ FAIL: System performance needs optimization');
  }
  
  console.log('');
}

// Run tests
main().catch(console.error);

