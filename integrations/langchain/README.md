# SEC EDGAR AgentKit for LangChain

AI-powered SEC filing analysis toolkit for LangChain agents. Available in both Python and TypeScript.

## 🐍 Python Version

The Python implementation works with standard LangChain and is perfect for:
- Jupyter notebooks and Google Colab
- Data science workflows
- Research and analysis
- Quick prototyping

[📁 View Python Implementation](./python/)

```bash
pip install sec-edgar-langchain
```

## 📦 TypeScript Version

The TypeScript implementation works with LangChain.js and is ideal for:
- Node.js applications
- Web APIs and services
- React/Next.js applications
- Production deployments

[📁 View TypeScript Implementation](./typescript/)

```bash
npm install @sec-edgar-agentkit/langchain
```

## Features

Both versions provide the same powerful capabilities:

- 🔍 **Company Search**: Look up CIK numbers and company information
- 📄 **Filing Retrieval**: Search and fetch 10-K, 10-Q, 8-K, and other SEC filings
- 💰 **Financial Analysis**: Extract financial statements and XBRL data
- 📊 **Insider Trading**: Track Form 4 filings and insider transactions
- 🎯 **Material Events**: Monitor 8-K filings for important announcements
- 🤖 **AI Analysis**: Leverage LLMs to interpret and summarize filing data

## Quick Start

### Python
```python
from sec_edgar_langchain import SECEdgarToolkit, SECEdgarConfig
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent

config = SECEdgarConfig(user_agent="MyApp/1.0 (email@example.com)")
toolkit = SECEdgarToolkit(config)
tools = toolkit.get_tools()

llm = ChatOpenAI(model="gpt-4")
agent = create_react_agent(llm, tools, prompt)
```

### TypeScript
```typescript
import { SECEdgarAgentToolkit } from '@sec-edgar-agentkit/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createStructuredChatAgent } from 'langchain/agents';

const toolkit = new SECEdgarAgentToolkit({
  userAgent: 'MyApp/1.0 (email@example.com)'
});

const tools = toolkit.getTools();
const llm = new ChatOpenAI({ modelName: 'gpt-4' });
const agent = await createStructuredChatAgent({ llm, tools, prompt });
```

## Demo Notebooks

- [🐍 Python Jupyter Notebook](./python/demo.ipynb) - Run in Jupyter or Google Colab
- [📦 TypeScript Examples](./typescript/demo.ipynb) - Node.js implementation examples

## Use Cases

- **Earnings Analysis**: Automated quarterly earnings report analysis
- **Portfolio Monitoring**: Track multiple companies' financial health
- **Risk Assessment**: Identify material risks from recent filings
- **Insider Trading Signals**: Monitor executive buying/selling patterns
- **Competitive Intelligence**: Compare companies side-by-side
- **Event Detection**: Real-time alerts for 8-K material events

## Resources

- [SEC EDGAR Documentation](https://www.sec.gov/edgar)
- [LangChain Python Docs](https://python.langchain.com)
- [LangChain.js Docs](https://js.langchain.com)
- [GitHub Repository](https://github.com/stefanoamorelli/sec-edgar-agentkit)

## License

AGPL-3.0 - See [LICENSE](./LICENSE) for details.