# MCP-use Integration

Simple, natural language interface to SEC EDGAR data using MCP-use.

## Usage

```javascript
import { agent, lookupCompany, analyzeFinancials } from './integrations/mcp-use';

// Natural language queries
const result = await agent.use("What were the key events in Tesla's recent 8-K filings?");
console.log(result);

// Or use pre-built functions
const appleInfo = await lookupCompany('Apple Inc');
const msftAnalysis = await analyzeFinancials('MSFT', 3);
```

## Available Functions

### lookupCompany(query)
Look up company information by name or ticker.

```javascript
const info = await lookupCompany('NVIDIA');
// Returns CIK, filing info, and financial metrics
```

### analyzeFinancials(ticker, years)
Analyze financial performance over specified years.

```javascript
const analysis = await analyzeFinancials('AAPL', 5);
// Returns revenue trends, margins, ratios, growth rates
```

### analyzeInsiderTrading(ticker, period)
Get insider trading activity analysis.

```javascript
const insiders = await analyzeInsiderTrading('TSLA', 'quarter');
// Returns buy/sell summary, significant transactions
```

### analyze8KEvents(ticker, limit)
Summarize recent 8-K events.

```javascript
const events = await analyze8KEvents('GOOGL', 10);
// Returns material changes, acquisitions, leadership changes
```

## Direct Agent Usage

For custom queries, use the agent directly:

```javascript
const response = await agent.use(`
  Compare the revenue growth of Apple, Microsoft, and Google
  over the last 3 years. Include their profit margins and
  any significant events that affected their performance.
`);
```