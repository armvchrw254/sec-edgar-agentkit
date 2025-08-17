import { runFinancialAnalysis, runComprehensiveAnalysis } from '@sec-edgar-agentkit/langgraph';

/**
 * Example demonstrating real SEC EDGAR data analysis with LangGraph workflows
 * 
 * This will:
 * 1. Look up company CIKs
 * 2. Fetch recent filings
 * 3. Extract financial data
 * 4. Analyze trends
 * 5. Generate insights
 */

async function demonstrateFinancialAnalysis() {
  console.log('='.repeat(60));
  console.log('SEC EDGAR LangGraph - Financial Analysis Workflow');
  console.log('='.repeat(60));
  
  const companies = ['AAPL', 'MSFT', 'GOOGL'];
  console.log(`\nAnalyzing: ${companies.join(', ')}`);
  console.log('This workflow will:');
  console.log('  1. Look up company CIKs');
  console.log('  2. Fetch recent 10-K filings');
  console.log('  3. Extract financial statements');
  console.log('  4. Calculate year-over-year growth');
  console.log('  5. Generate comparative insights\n');

  try {
    const startTime = Date.now();
    
    const result = await runFinancialAnalysis(companies, {
      filingType: '10-K',
      yearsBack: 3
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Analysis completed in ${elapsed}s\n`);
    
    // Display results
    if (result.companies.length > 0) {
      console.log('📊 Companies Analyzed:');
      result.companies.forEach(company => {
        console.log(`  • ${company.name || company.ticker}`);
        if (company.cik) {
          console.log(`    CIK: ${company.cik}`);
        }
      });
    }
    
    if (result.filings.length > 0) {
      console.log(`\n📄 Filings Processed: ${result.filings.length}`);
    }
    
    if (result.insights.length > 0) {
      console.log('\n💡 Key Insights:');
      result.insights.forEach(insight => {
        console.log(`  • ${insight}`);
      });
    }
    
    if (Object.keys(result.comparisons).length > 0) {
      console.log('\n📈 Financial Comparisons:');
      for (const [ticker, data] of Object.entries(result.comparisons)) {
        console.log(`\n  ${ticker}:`);
        if (data.revenueGrowth !== undefined) {
          console.log(`    Revenue Growth: ${data.revenueGrowth.toFixed(1)}%`);
        }
        if (data.latestRevenue) {
          console.log(`    Latest Revenue: $${(data.latestRevenue / 1e9).toFixed(2)}B`);
        }
      }
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Issues Encountered:');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    // Display final report if available
    const finalMessage = result.messages[result.messages.length - 1];
    if (finalMessage && finalMessage.content) {
      console.log('\n' + '='.repeat(60));
      console.log('GENERATED REPORT:');
      console.log('='.repeat(60));
      console.log(finalMessage.content);
    }
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
}

async function demonstrateComprehensiveAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('SEC EDGAR LangGraph - Comprehensive Analysis Workflow');
  console.log('='.repeat(60));
  
  const company = 'TSLA';
  console.log(`\nPerforming comprehensive analysis of: ${company}`);
  console.log('This workflow includes:');
  console.log('  • Financial performance analysis');
  console.log('  • Material events (8-K filings)');
  console.log('  • Insider trading activity');
  console.log('  • Integrated insights\n');

  try {
    const startTime = Date.now();
    
    const result = await runComprehensiveAnalysis([company], {
      includeInsiderTrading: true,
      include8K: true
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Comprehensive analysis completed in ${elapsed}s\n`);
    
    // Display all insights
    if (result.insights.length > 0) {
      console.log('🔍 Analysis Results:');
      result.insights.forEach(insight => {
        console.log(`  • ${insight}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Workflow failed:', error);
  }
}

// Run demonstrations
async function main() {
  console.log('SEC EDGAR LangGraph Integration Examples\n');
  
  // Check if running with real toolkit or mock
  try {
    await import('@sec-edgar-agentkit/langchain');
    console.log('✅ Using real SEC EDGAR toolkit\n');
  } catch {
    console.log('ℹ️ Using mock implementation (install @sec-edgar-agentkit/langchain for real data)\n');
  }
  
  await demonstrateFinancialAnalysis();
  await demonstrateComprehensiveAnalysis();
  
  console.log('\n' + '='.repeat(60));
  console.log('Examples completed!');
  console.log('='.repeat(60));
}

main().catch(console.error);