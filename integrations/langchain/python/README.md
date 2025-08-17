# SEC EDGAR LangChain Toolkit (Python)

Turn SEC filings into actionable insights with LangChain agents.

## Installation

```bash
pip install sec-edgar-langchain
```

Or install from source:
```bash
pip install -e .
```

## Quick Start

```python
from sec_edgar_langchain import SECEdgarToolkit, SECEdgarConfig
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent

# Configure toolkit
config = SECEdgarConfig(
    user_agent="YourApp/1.0 (your.email@example.com)"  # Required by SEC
)

toolkit = SECEdgarToolkit(config=config)
tools = toolkit.get_tools()

# Create agent
llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Analyze companies
result = executor.invoke({
    "input": "What is NVIDIA's latest quarterly revenue and how does it compare to last year?"
})
print(result["output"])
```

## Available Tools

| Tool | Description |
|------|-------------|
| `sec_edgar_cik_lookup` | Look up company CIK by name or ticker |
| `sec_edgar_company_info` | Get detailed company information |
| `sec_edgar_company_facts` | Extract XBRL financial data points |
| `sec_edgar_filing_search` | Search for specific filing types |
| `sec_edgar_filing_content` | Extract content from filings |
| `sec_edgar_financial_statements` | Get financial statements |
| `sec_edgar_insider_trading` | Analyze Form 4 insider transactions |
| `sec_edgar_8k_events` | Monitor material events |
| `sec_edgar_compare_financials` | Compare companies side-by-side |

## Examples

### Earnings Analysis
```python
query = """
Analyze Apple (AAPL) latest earnings:
1. Latest quarterly revenue and net income
2. Year-over-year growth
3. Any recent 8-K events
"""
result = executor.invoke({"input": query})
```

### Insider Trading
```python
query = """
Check Tesla (TSLA) insider trading:
- Form 4 filings last 30 days
- Net buying or selling?
- Which executives are trading?
"""
result = executor.invoke({"input": query})
```

### Company Comparison
```python
query = """
Compare Microsoft (MSFT) vs Google (GOOGL):
- Latest revenues
- Profit margins
- Recent material events
Which looks stronger?
"""
result = executor.invoke({"input": query})
```

## Jupyter Notebook Demo

See [demo.ipynb](./demo.ipynb) for a complete walkthrough with:
- Live earnings analysis
- Portfolio scanning
- Custom analysis pipelines
- Batch processing examples

## Configuration

### Required Settings
- `user_agent`: Must follow SEC format: "AppName/Version (contact@email.com)"

### Optional Settings
- `rate_limit_delay`: Delay between API calls (default: 0.1 seconds)

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black src/
ruff check src/

# Type checking
mypy src/
```

## API Rate Limits

The SEC EDGAR API has rate limits:
- Maximum 10 requests per second
- User-Agent header is required
- Be respectful of the free public service

## License

AGPL-3.0 - See [LICENSE](../LICENSE) for details.

## Support

- [GitHub Issues](https://github.com/stefanoamorelli/sec-edgar-agentkit/issues)
- [Documentation](https://github.com/stefanoamorelli/sec-edgar-agentkit)