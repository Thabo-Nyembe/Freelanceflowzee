
const fs = require('fs');
const Context7TestIntegration = require('./context7-test-integration');

class Context7Reporter {
  constructor(options = {}) {
    this.integration = new Context7TestIntegration();
    this.results = [];
  }

  onBegin(config, suite) {
    console.log('🤖 Context7 AI Test Analysis Started');
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message || null,
      retry: result.retry
    });
  }

  async onEnd(result) {
    console.log('🤖 Generating AI-enhanced test analysis...');
    
    const testOutput = JSON.stringify(this.results, null, 2);
    const report = this.integration.generateEnhancedReport(testOutput);
    
    // Save results for further analysis
    fs.writeFileSync('test-results/context7-analysis.json', testOutput);
    
    console.log('✅ Context7 analysis complete');
  }
}

module.exports = Context7Reporter;
