import { runComprehensiveAnalysis } from '@sec-edgar-agentkit/langgraph';

async function main() {
  console.log('Starting comprehensive analysis workflow...\n');

  const companies = ['AAPL'];
  
  console.log(`Analyzing: ${companies.join(', ')}`);
  console.log('This will include:');
  console.log('  ✓ Financial performance (10-K analysis)');
  console.log('  ✓ Recent events (8-K filings)');
  console.log('  ✓ Insider trading activity');
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    const result = await runComprehensiveAnalysis(
      companies,
      {
        includeInsiderTrading: true,
        include8K: true
      }
    );

    console.log('📈 COMPREHENSIVE ANALYSIS RESULTS\n');
    
    if (result.companies.length > 0) {
      console.log('Companies Analyzed:');
      result.companies.forEach(company => {
        console.log(`  • ${company.name || company.ticker} (${company.ticker})`);
        if (company.cik) console.log(`    CIK: ${company.cik}`);
      });
    }

    if (result.insights.length > 0) {
      console.log('\n💡 Key Insights:');
      result.insights.forEach(insight => {
        console.log(`  • ${insight}`);
      });
    }

    if (Object.keys(result.comparisons).length > 0) {
      console.log('\n📊 Financial Metrics:');
      for (const [ticker, data] of Object.entries(result.comparisons)) {
        console.log(`\n  ${ticker}:`);
        console.log(`    ${JSON.stringify(data, null, 4).replace(/\n/g, '\n    ')}`);
      }
    }

    if (result.errors.length > 0) {
      console.log('\n⚠️ Issues Encountered:');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    const report = result.messages[result.messages.length - 1]?.content;
    if (report) {
      console.log('\n' + '='.repeat(50));
      console.log('FULL REPORT:');
      console.log('='.repeat(50));
      console.log(report);
    }

    console.log('\n✅ Analysis workflow completed successfully!');
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
}

main();