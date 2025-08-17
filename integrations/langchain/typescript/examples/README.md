# TypeScript Examples

## Running the Demo

### Quick Start
```bash
# Install dependencies
npm install

# Run with tsx (TypeScript execute)
npx tsx examples/demo.ts
```

### Build and Run
```bash
# Build TypeScript
npm run build

# Run compiled JavaScript
node dist/examples/demo.js
```

## Interactive TypeScript Notebooks

While Jupyter notebooks are primarily for Python, there are TypeScript/JavaScript alternatives:

### 1. **Deno Jupyter** (Recommended)
Deno supports Jupyter notebooks natively for TypeScript!

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Install Jupyter kernel
deno jupyter --unstable --install

# Start Jupyter
jupyter notebook
# Then create a new notebook with "Deno" kernel
```

### 2. **RunKit** (Online)
- Visit [runkit.com](https://runkit.com)
- Paste TypeScript code directly
- Interactive Node.js environment
- Great for quick demos

### 3. **Observable** (Online)
- Visit [observablehq.com](https://observablehq.com)
- JavaScript notebooks in the browser
- Great for data visualization

### 4. **Quokka.js** (VS Code)
- Install Quokka.js extension in VS Code
- Inline execution results
- Live coding playground

### 5. **ts-node REPL**
```bash
# Interactive TypeScript REPL
npx ts-node

# Then type TypeScript code interactively
> import { SECEdgarAgentToolkit } from '@sec-edgar-agentkit/langchain';
> const toolkit = new SECEdgarAgentToolkit({...});
```

## Example Files

- `demo.ts` - Complete working example with all features
- `earnings-analysis.ts` - Focused earnings analysis workflow
- `portfolio-scanner.ts` - Batch portfolio analysis
- `api-server.ts` - Express API server example

## Environment Variables

Create a `.env` file:
```bash
OPENAI_API_KEY=your-api-key-here
```

Or set directly:
```bash
export OPENAI_API_KEY="your-api-key-here"
npx tsx examples/demo.ts
```