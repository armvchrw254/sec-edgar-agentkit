/**
 * Simple SEC EDGAR queries using MCP-use
 * 
 * This example demonstrates how to use the natural language interface
 * to query SEC EDGAR data without complex setup.
 */

import { 
  agent, 
  lookupCompany, 
  analyzeFinancials, 
  analyzeInsiderTrading,
  analyze8KEvents 
} from '../../integrations/mcp-use/index.js';

async function runExamples() {
  console.log('SEC EDGAR MCP-use Examples\n');
  console.log('=' * 50);

  try {
    // Example 1: Simple company lookup
    console.log('\n1. Looking up Apple Inc...');
    const appleInfo = await lookupCompany('Apple Inc');
    console.log('Result:', appleInfo);

    // Example 2: Financial analysis
    console.log('\n2. Analyzing Microsoft financials (3 years)...');
    const msftFinancials = await analyzeFinancials('MSFT', 3);
    console.log('Result:', msftFinancials);

    // Example 3: Insider trading analysis
    console.log('\n3. Checking Tesla insider trading (last quarter)...');
    const teslaInsiders = await analyzeInsiderTrading('TSLA', 'quarter');
    console.log('Result:', teslaInsiders);

    // Example 4: Recent 8-K events
    console.log('\n4. Getting recent 8-K events for Amazon...');
    const amazonEvents = await analyze8KEvents('AMZN', 5);
    console.log('Result:', amazonEvents);

    // Example 5: Custom natural language query
    console.log('\n5. Custom query using natural language...');
    const customQuery = await agent.use(`
      Compare the revenue growth of Apple, Microsoft, and Google 
      over the last 2 years. Include their profit margins and 
      any major acquisitions or events that affected performance.
    `);
    console.log('Result:', customQuery);

    // Example 6: Complex analysis
    console.log('\n6. Complex multi-company analysis...');
    const complexAnalysis = await agent.use(`
      Analyze the semiconductor industry by looking at:
      1. NVIDIA's recent financial performance and growth
      2. Intel's competitive position and challenges
      3. AMD's market share gains
      4. Recent insider trading patterns across all three
      Include specific numbers from their latest 10-K filings.
    `);
    console.log('Result:', complexAnalysis);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Cleanup
    await agent.disconnect();
    console.log('\n\nDisconnected from SEC EDGAR MCP server.');
  }
}

// Run the examples
if (import.meta.url === `file://\${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { runExamples };