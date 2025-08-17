import { monitorEvents } from '@sec-edgar-agentkit/langgraph';

async function main() {
  console.log('Starting event monitoring workflow...\n');

  const watchlist = ['TSLA', 'NVDA', 'AMD'];
  
  console.log(`Monitoring events for: ${watchlist.join(', ')}\n`);

  try {
    const result = await monitorEvents(watchlist);

    console.log('Event Monitoring Report\n');
    console.log('=' .repeat(50));
    
    if (result.insights.length > 0) {
      console.log('\n📊 Key Events Detected:');
      result.insights.forEach(insight => {
        console.log(`  • ${insight}`);
      });
    } else {
      console.log('\nNo significant events detected.');
    }

    if (result.errors.length > 0) {
      console.log('\n⚠️ Issues:');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    const report = result.messages[result.messages.length - 1]?.content;
    if (report) {
      console.log('\nDetailed Report:');
      console.log(report);
    }
  } catch (error) {
    console.error('Monitoring failed:', error);
  }
}

main();