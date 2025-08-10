import { MCPAgent } from 'mcp-use';

// Initialize the SEC EDGAR MCP agent
const agent = new MCPAgent('SEC EDGAR Assistant');

// Connect to the SEC EDGAR MCP server
await agent.connect('sec-edgar-mcp');

// Example: Company lookup function
async function lookupCompany(query) {
  const prompt = `Look up the company "${query}" and provide their CIK, latest filing information, and key financial metrics.`;
  const response = await agent.use(prompt);
  return response;
}

// Example: Financial analysis function
async function analyzeFinancials(ticker, years = 3) {
  const prompt = `
    Analyze the financial performance of ${ticker} over the last ${years} years.
    Include:
    1. Revenue trends
    2. Profit margins
    3. Key financial ratios
    4. Year-over-year growth rates
    5. Any significant changes or events
  `;
  const response = await agent.use(prompt);
  return response;
}

// Example: Insider trading analysis
async function analyzeInsiderTrading(ticker, period = 'quarter') {
  const prompt = `
    Analyze insider trading activity for ${ticker} in the last ${period}.
    Show:
    - Total buys vs sells
    - Significant transactions
    - Key insiders involved
    - Trend analysis
  `;
  const response = await agent.use(prompt);
  return response;
}

// Example: 8-K event analysis
async function analyze8KEvents(ticker, limit = 5) {
  const prompt = `
    Get the last ${limit} 8-K filings for ${ticker} and summarize the key events reported.
    Focus on material changes, acquisitions, leadership changes, and financial updates.
  `;
  const response = await agent.use(prompt);
  return response;
}

// Export functions for use in other modules
export {
  agent,
  lookupCompany,
  analyzeFinancials,
  analyzeInsiderTrading,
  analyze8KEvents
};

// Example usage
if (import.meta.url === `file://\${process.argv[1]}`) {
  console.log('SEC EDGAR MCP-use Agent Example\\n');
  
  // Example 1: Look up Apple
  console.log('Looking up Apple Inc...');
  const appleInfo = await lookupCompany('Apple Inc');
  console.log(appleInfo);
  
  // Example 2: Analyze Microsoft financials
  console.log('\\nAnalyzing Microsoft financials...');
  const msftFinancials = await analyzeFinancials('MSFT', 3);
  console.log(msftFinancials);
  
  // Cleanup
  await agent.disconnect();
}