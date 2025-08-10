# SEC EDGAR Agent Kit Examples

This directory contains examples for each supported framework.

## Directory Structure

```
examples/
├── langchain/          # LangChain agent examples
│   ├── basic-usage.ts  # Basic toolkit usage
│   └── financial-analysis.ts  # Advanced financial analysis
├── mcp-use/           # Direct MCP usage examples
│   └── simple-queries.js  # Natural language queries
└── huggingface-gradio/  # Hugging Face Spaces example
    └── app.py          # Gradio interface for HF deployment
```

## Running Examples

### LangChain Examples

```bash
cd examples/langchain
bun run basic-usage.ts
bun run financial-analysis.ts
```

### MCP-use Examples

```bash
cd examples/mcp-use
node simple-queries.js
```

### Hugging Face Gradio

The Hugging Face example can be deployed to Hugging Face Spaces or run locally:

```bash
cd examples/huggingface-gradio
pip install -r ../../integrations/gradio/requirements.txt
python app.py
```

## Prerequisites

1. Install the SEC EDGAR MCP server:
   ```bash
   pip install sec-edgar-mcp
   ```

2. Make sure the MCP server is accessible (either running locally or configured)

3. For LangChain examples, set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

## Example Use Cases

### 1. Company Research (LangChain)
The basic usage example shows how to:
- Look up company CIKs
- Search for recent filings
- Analyze 8-K events
- Track insider trading

### 2. Financial Analysis (LangChain)
The financial analysis example demonstrates:
- Multi-year revenue analysis
- Financial statement extraction
- XBRL data parsing
- Comprehensive company health assessment

### 3. Natural Language Queries (MCP-use)
The MCP-use example shows:
- Simple function-based queries
- Natural language analysis
- Multi-company comparisons
- Industry analysis

### 4. Interactive Interface (Gradio)
The Gradio example provides:
- Web-based company search
- Filing browser
- Visual data analysis
- Export capabilities