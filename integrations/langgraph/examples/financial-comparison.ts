import { runFinancialAnalysis } from '@sec-edgar-agentkit/langgraph';

async function main() {
  console.log('Starting financial comparison workflow...\n');

  try {
    const result = await runFinancialAnalysis(
      ['AAPL', 'MSFT', 'GOOGL'],
      {
        filingType: '10-K',
        yearsBack: 3
      }
    );

    console.log('Analysis Complete!\n');
    console.log('Key Insights:');
    result.insights.forEach(insight => {
      console.log(`  - ${insight}`);
    });

    console.log('\nFinancial Comparisons:');
    console.log(JSON.stringify(result.comparisons, null, 2));

    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach(error => {
        console.log(`  ⚠️ ${error}`);
      });
    }

    const report = result.messages[result.messages.length - 1]?.content;
    if (report) {
      console.log('\n' + report);
    }
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

main();