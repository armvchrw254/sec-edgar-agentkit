# SEC EDGAR Agentkit for LangGraph

Stateful, multi-step workflows for SEC EDGAR data analysis using LangGraph.

## Installation

```bash
npm install @sec-edgar-agentkit/langgraph @langchain/core @langchain/langgraph @langchain/openai
```

## Features

- **Stateful Workflows**: Track analysis progress across multiple steps
- **Conditional Routing**: Different paths based on filing types and data availability
- **Parallel Processing**: Analyze multiple companies simultaneously
- **Error Recovery**: Graceful handling of API failures and missing data
- **Pre-built Workflows**: Ready-to-use graphs for common analysis patterns

## Quick Start

```typescript
import { runFinancialAnalysis } from '@sec-edgar-agentkit/langgraph';

// Simple financial comparison
const result = await runFinancialAnalysis(['AAPL', 'MSFT', 'GOOGL']);

console.log(result.insights);  // Revenue growth, margin trends
console.log(result.comparisons);  // Side-by-side metrics
```

## Available Workflows

### 1. Financial Analysis Workflow

Compares financial performance across multiple companies:

```typescript
import { runFinancialAnalysis } from '@sec-edgar-agentkit/langgraph';

const result = await runFinancialAnalysis(
  ['AAPL', 'MSFT', 'GOOGL'],
  {
    filingType: '10-K',  // or '10-Q', '20-F'
    yearsBack: 3
  }
);

// Result includes:
// - Year-over-year revenue growth
// - Margin analysis
// - Key financial ratios
// - Peer comparisons
```

### 2. Comprehensive Analysis Workflow

Complete analysis including financials, events, and insider trading:

```typescript
import { runComprehensiveAnalysis } from '@sec-edgar-agentkit/langgraph';

const result = await runComprehensiveAnalysis(
  ['TSLA'],
  {
    includeInsiderTrading: true,
    include8K: true
  }
);

// Combines:
// - Financial performance
// - Material events (8-K)
// - Insider trading patterns
// - Integrated insights
```

### 3. Event Monitoring Workflow

Track material events and changes:

```typescript
import { monitorEvents } from '@sec-edgar-agentkit/langgraph';

const result = await monitorEvents(
  ['NVDA', 'AMD'],
  {
    checkInterval: 3600000  // Check hourly
  }
);

// Monitors:
// - 8-K filings
// - Insider transactions
// - Material changes
```

## Building Custom Workflows

Create your own analysis graphs:

```typescript
import { StateGraph } from '@langchain/langgraph';
import { 
  AnalysisState,
  lookupCompanies,
  fetchFilings,
  extractFinancials,
  generateReport 
} from '@sec-edgar-agentkit/langgraph';

// Define custom workflow
const workflow = new StateGraph<AnalysisState>({
  // State channels configuration
});

// Add nodes
workflow.addNode('lookup', lookupCompanies);
workflow.addNode('fetch', fetchFilings);
workflow.addNode('analyze', customAnalysisNode);
workflow.addNode('report', generateReport);

// Define flow
workflow.setEntryPoint('lookup');
workflow.addEdge('lookup', 'fetch');

// Conditional routing
workflow.addConditionalEdges(
  'fetch',
  async (state) => {
    if (state.filings.length === 0) return 'report';
    return 'analyze';
  },
  {
    'analyze': 'analyze',
    'report': 'report'
  }
);

const graph = workflow.compile();
```

## State Management

The workflow state tracks:

```typescript
interface AnalysisState {
  messages: BaseMessage[];        // Conversation history
  companies: CompanyData[];       // Companies being analyzed
  filings: Filing[];              // SEC filings retrieved
  financialData: FinancialMetrics[];  // Extracted metrics
  comparisons: Record<string, any>;   // Comparative analysis
  insights: string[];             // Generated insights
  errors: string[];               // Error tracking
  currentStep: string;            // Workflow position
  nextSteps: string[];            // Planned actions
}
```

## Available Nodes

Pre-built nodes for common operations:

- `lookupCompanies`: CIK lookup and company info
- `fetchFilings`: Retrieve SEC filings
- `extractFinancials`: Parse financial statements
- `analyzeTrends`: Calculate growth and trends
- `handle8KEvents`: Process material events
- `analyzeInsiderTrading`: Analyze Forms 3/4/5
- `generateReport`: Create analysis summary

## Streaming Results

Get real-time updates as the workflow progresses:

```typescript
import { createFinancialAnalysisWorkflow } from '@sec-edgar-agentkit/langgraph';

const workflow = createFinancialAnalysisWorkflow();

for await (const state of workflow.stream(initialState)) {
  console.log(`Step: ${state.currentStep}`);
  console.log(`Progress: ${state.insights.length} insights generated`);
}
```

## Error Handling

Workflows continue despite individual failures:

```typescript
const result = await runFinancialAnalysis(['AAPL', 'INVALID_TICKER']);

// Check for errors
if (result.errors.length > 0) {
  console.log('Some operations failed:', result.errors);
}

// Partial results still available
console.log('Successful analyses:', result.insights);
```

## Examples

See the `examples/` directory for complete implementations:

- `financial-comparison.ts`: Multi-company financial analysis
- `comprehensive-analysis.ts`: Full company deep-dive
- `event-monitoring.ts`: Real-time event tracking

## Comparison with LangChain Integration

| Feature | LangChain | LangGraph |
|---------|-----------|-----------|
| **Use Case** | Simple Q&A, single lookups | Multi-step analysis, comparisons |
| **State Management** | Stateless | Stateful across workflow |
| **Execution** | Sequential tools | Parallel processing, conditional routing |
| **Best For** | "What is Apple's revenue?" | "Compare 3-year trends across tech giants" |

## Requirements

- Node.js 18+
- OpenAI API key (or other LLM provider)
- SEC EDGAR Agentkit tools installed

## License

AGPL-3.0 - See [LICENSE](../../LICENSE) for details.

## Author

Stefano Amorelli <stefano@amorelli.tech>