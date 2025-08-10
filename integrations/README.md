# SEC EDGAR Agent Kit - Integrations

This directory contains independently publishable packages for different frameworks and platforms.

## Available Integrations

### 1. [@sec-edgar-agentkit/langchain](./langchain)
**Status**: Ready to publish  
**Language**: TypeScript  
**Registry**: npm  

LangChain toolkit for building agents that can access SEC EDGAR data. Includes all tools as StructuredTools compatible with LangChain agents.

### 2. [@sec-edgar-agentkit/mcp-use](./mcp-use)
**Status**: Ready to publish  
**Language**: JavaScript (ESM)  
**Registry**: npm  

Natural language interface using MCP-use. Simple API for querying SEC EDGAR data with plain English.

### 3. [@sec-edgar-agentkit/gradio](./gradio)
**Status**: Ready for deployment  
**Language**: Python  
**Registry**: Could be published to PyPI  

Interactive web interface built with Gradio. Can be deployed to Hugging Face Spaces or run locally.

### 4. [@sec-edgar-agentkit/dify-plugin](./dify)
**Status**: Ready for installation  
**Language**: Python + YAML  
**Registry**: Dify Marketplace (manual)  

Complete Dify plugin with all SEC EDGAR tools defined as YAML configurations.

## Publishing

Each package is versioned and published independently:

```bash
# Example: Publishing LangChain package
cd integrations/langchain
npm version patch  # or minor/major
bun run build
npm publish --access public
```

## Development

All packages share the same author and license:
- **Author**: Stefano Amorelli <stefano@amorelli.tech>
- **License**: AGPL-3.0

Each package has its own:
- package.json with specific dependencies
- README.md with usage instructions
- Tests in __tests__ directory
- Build configuration (if needed)