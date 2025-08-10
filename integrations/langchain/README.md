# LangChain Integration

SEC EDGAR toolkit for LangChain agents.

## Installation

```bash
npm install @langchain/core @langchain/openai langchain zod
```

## Usage

```typescript
import { SECEdgarAgentToolkit } from './integrations/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Initialize toolkit
const toolkit = new SECEdgarAgentToolkit({
  mcpServerUrl: 'sec-edgar-mcp',
  configuration: {
    actions: {
      companies: { lookupCIK: true, getInfo: true, getFacts: true },
      filings: { search: true, getContent: true, analyze8K: true },
      financial: { getStatements: true, parseXBRL: true },
      insiderTrading: { analyzeTransactions: true }
    }
  }
});

// Connect to MCP server
await toolkit.connect();

// Create agent
const llm = new ChatOpenAI({ modelName: 'gpt-4' });
const tools = toolkit.getTools();

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a financial analyst with access to SEC EDGAR data.'],
  ['human', '{input}'],
  ['assistant', '{agent_scratchpad}']
]);

const agent = await createStructuredChatAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools });

// Use the agent
const result = await executor.invoke({
  input: "What is Apple's latest revenue and how does it compare to last year?"
});

console.log(result.output);

// Disconnect when done
await toolkit.disconnect();
```

## Available Tools

- `sec_edgar_cik_lookup`: Look up company CIK
- `sec_edgar_company_info`: Get company information
- `sec_edgar_company_facts`: Get XBRL company facts
- `sec_edgar_filing_search`: Search for filings
- `sec_edgar_filing_content`: Extract filing content
- `sec_edgar_analyze_8k`: Analyze 8-K reports
- `sec_edgar_financial_statements`: Get financial statements
- `sec_edgar_xbrl_parse`: Parse XBRL data
- `sec_edgar_insider_trading`: Analyze insider trading

## Configuration

Control which tools are available:

```typescript
const toolkit = new SECEdgarAgentToolkit({
  mcpServerUrl: 'sec-edgar-mcp',
  configuration: {
    actions: {
      companies: {
        lookupCIK: true,
        getInfo: false,  // Disable company info tool
        getFacts: true
      },
      // Disable all financial tools
      financial: false
    }
  }
});
```