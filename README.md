# SEC EDGAR Agent Kit

<p align="left">
  <img src="https://img.shields.io/npm/v/@sec-edgar-agentkit/langchain" alt="npm version" />
  <img src="https://img.shields.io/github/license/stefanoamorelli/sec-edgar-agentkit" alt="License" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Nx-143055?logo=nx&logoColor=white" alt="Nx Monorepo" />
  <img src="https://img.shields.io/badge/AI-Agents-FF6B6B?logo=openai&logoColor=white" alt="AI Agents" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?logo=chainlink&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/MCP-Protocol-4A90E2?logo=protocol&logoColor=white" alt="MCP Protocol" />
</p>



A multi-framework monorepo toolkit for building AI agents and applications that can access and analyze [SEC EDGAR](https://www.sec.gov/edgar) filing data. Built on top of the [sec-edgar-mcp](https://github.com/stefanoamorelli/sec-edgar-mcp) Model Context Protocol server.

This monorepo contains multiple packages and integrations, each optimized for different AI agent frameworks and use cases.

## Supported Frameworks

- <img src="https://python.langchain.com/img/favicon.ico" alt="LangChain" width="16" height="16"/> **[LangChain](https://github.com/langchain-ai/langchain)** - Build sophisticated agents with LangChain's agent framework ([integrations/langchain](./integrations/langchain))
- <img src="https://avatars.githubusercontent.com/u/207005519?s=48&v=4" alt="MCP-use" width="16" height="16"/> **[MCP-use](https://github.com/mcp-use/mcp-use)** - Create MCP agents with any LLM for accessing SEC EDGAR data ([integrations/mcp-use](./integrations/mcp-use))
- <img src="https://avatars.githubusercontent.com/u/51063788?s=48&v=4" alt="Gradio" width="16" height="16"/> **[Gradio](https://github.com/gradio-app/gradio)** - Interactive web interface for exploring SEC filings ([integrations/gradio](./integrations/gradio))
- <img src="https://cloud.dify.ai/favicon.ico" alt="Dify" width="16" height="16"/> **[Dify](https://github.com/langgenius/dify)** - Plugin for Dify workflow automation platform ([integrations/dify](./integrations/dify))
- <img src="https://huggingface.co/favicon.ico" alt="smolagents" width="16" height="16"/> **[smolagents](https://github.com/huggingface/smolagents)** - Lightweight agent framework by Hugging Face for quick prototypes ([integrations/smolagents](./integrations/smolagents))

## Features

- **Company information**: Look up CIKs, retrieve company details, and access company facts
- **Filing search & analysis**: Search for filings, extract content, and analyze 8-K reports
- **Financial data**: Extract financial statements and parse XBRL data with precision
- **Insider trading**: Analyze Forms 3, 4, and 5 for insider transaction data
- **LangChain integration**: Seamless integration with LangChain agents and chains

## Installation

This monorepo is organized using modern tooling and contains multiple packages. You can install individual packages from npm:

### Install individual packages

```bash
# LangChain toolkit
npm install @sec-edgar-agentkit/langchain

# MCP-use natural language interface
npm install @sec-edgar-agentkit/mcp-use

# smolagents Python package
pip install sec-edgar-agentkit-smolagents
```

### Gradio and Dify

For Gradio and Dify setup instructions, see their respective documentation:
- Gradio: [integrations/gradio/README.md](./integrations/gradio/README.md)
- Dify: [integrations/dify/README.md](./integrations/dify/README.md)

### Development setup

```bash
# Clone the repository
git clone https://github.com/stefanoamorelli/sec-edgar-agentkit
cd sec-edgar-agentkit

# Install all dependencies (monorepo)
bun install

# Build all packages
bun run build
```

Prerequisites:
- [Bun](https://bun.sh/) (for TypeScript/JavaScript development)
- [Python](https://www.python.org/) 3.8+ (for Gradio interface)
- `sec-edgar-mcp` server: `pip install sec-edgar-mcp`

## Quick start

### LangChain

```typescript
import { SECEdgarAgentToolkit } from './integrations/langchain';

const toolkit = new SECEdgarAgentToolkit({
  mcpServerUrl: 'sec-edgar-mcp',
  configuration: {
    actions: {
      companies: { lookupCIK: true, getInfo: true },
      filings: { search: true, getContent: true },
    }
  }
});

const tools = toolkit.getTools();
// Use with any LangChain agent
```

### MCP-use

```javascript
import { agent, analyzeFinancials } from './integrations/mcp-use';

// Simple function calls
const appleInfo = await agent.use("Look up Apple's latest 10-K filing");
const analysis = await analyzeFinancials('AAPL', 3);
```

### Gradio interface

```bash
# Run the Gradio interface
cd integrations/gradio
./run.sh
# Access at http://localhost:7860

# Or manually:
pip install -r requirements.txt
python app.py
```

## Configuration

### Available actions

```typescript
{
  actions: {
    companies: {
      lookupCIK: boolean,      // CIK lookup by name/ticker
      getInfo: boolean,        // Company information
      getFacts: boolean,       // XBRL company facts
    },
    filings: {
      search: boolean,         // Search filings
      getContent: boolean,     // Extract filing content
      analyze8K: boolean,      // Analyze 8-K reports
      extractSection: boolean, // Extract specific sections
    },
    financial: {
      getStatements: boolean,  // Financial statements
      parseXBRL: boolean,      // XBRL data parsing
    },
    insiderTrading: {
      analyzeTransactions: boolean, // Forms 3/4/5 analysis
    }
  }
}
```

## Available tools

### Company tools
- `sec_edgar_cik_lookup`: Look up a company's CIK by name or ticker
- `sec_edgar_company_info`: Get detailed company information
- `sec_edgar_company_facts`: Retrieve XBRL company facts

### Filing tools
- `sec_edgar_filing_search`: Search for filings with filters
- `sec_edgar_filing_content`: Extract filing content
- `sec_edgar_analyze_8k`: Analyze 8-K reports

### Financial tools
- `sec_edgar_financial_statements`: Extract financial statements
- `sec_edgar_xbrl_parse`: Parse XBRL data for precise values

### Insider trading tools
- `sec_edgar_insider_trading`: Analyze insider transactions

## Examples

### Basic company analysis
```typescript
const result = await executor.invoke({
  input: "Find Microsoft's CIK and get their latest 10-K filing summary"
});
```

### Financial analysis
```typescript
const result = await executor.invoke({
  input: "Compare Apple's revenue growth over the last 3 years using their 10-K filings"
});
```

### Insider trading analysis
```typescript
const result = await executor.invoke({
  input: "Show me insider selling activity for Tesla in the last quarter"
});
```

## Framework-specific examples

### LangChain - Complex agent
```typescript
import { SECEdgarAgentToolkit } from './integrations/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

const toolkit = new SECEdgarAgentToolkit({
  mcpServerUrl: 'sec-edgar-mcp',
  configuration: {
    actions: {
      companies: { lookupCIK: true, getInfo: true },
      filings: { search: true, analyze8K: true },
      financial: { getStatements: true, parseXBRL: true },
    }
  }
});

const agent = await createStructuredChatAgent({
  llm: new ChatOpenAI({ modelName: 'gpt-4' }),
  tools: toolkit.getTools(),
  prompt: ChatPromptTemplate.fromMessages([
    ['system', 'You are a financial analyst with access to SEC EDGAR data.'],
    ['human', '{input}'],
    ['assistant', '{agent_scratchpad}']
  ])
});

const executor = new AgentExecutor({ agent, tools: toolkit.getTools() });
const result = await executor.invoke({
  input: "Compare Apple and Microsoft's revenue growth over the last 3 years"
});
```

### MCP-use - Simple queries
```javascript
import { agent } from './mcp-use';

// Natural language queries
const result = await agent.use(`
  Find Tesla's latest 8-K filing and summarize any material events.
  Also show me their insider trading activity for the past month.
`);

console.log(result);
```


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© 2025 [Stefano Amorelli](https://amorelli.tech)

This open-source project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html). This means:

- You can use, modify, and distribute this software
- If you modify and distribute it, you must release your changes under AGPL-3.0
- If you run a modified version on a server, you must provide the source code to users
- See the [LICENSE](LICENSE) file for full details

For commercial licensing options or other licensing inquiries, please contact stefano@amorelli.tech.

Author: [Stefano Amorelli](https://amorelli.tech)
