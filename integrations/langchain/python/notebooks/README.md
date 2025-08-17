# SEC EDGAR LangChain Notebooks

Interactive Jupyter notebooks for financial analysis using SEC EDGAR data and AI agents.

## 📚 Available Notebooks

### 🚀 Getting Started
- **[quickstart-earnings-analysis.ipynb](./quickstart-earnings-analysis.ipynb)**
  - 5-minute setup guide
  - Analyze any company's earnings instantly
  - Perfect for first-time users

### 📊 Complete Tutorials
- **[sec-edgar-financial-analysis.ipynb](./sec-edgar-financial-analysis.ipynb)**
  - Comprehensive financial analysis workflow
  - Multiple analysis techniques
  - Advanced agent configurations
  - Batch processing examples

### 🎯 Specialized Workflows
- **[portfolio-monitoring.ipynb](./portfolio-monitoring.ipynb)** *(coming soon)*
  - Track multiple stocks simultaneously
  - Automated portfolio health checks
  - Risk assessment across holdings

- **[insider-trading-signals.ipynb](./insider-trading-signals.ipynb)** *(coming soon)*
  - Form 4 analysis patterns
  - Executive trading trends
  - Sentiment scoring

- **[material-events-scanner.ipynb](./material-events-scanner.ipynb)** *(coming soon)*
  - 8-K filing monitoring
  - Real-time event detection
  - Market impact analysis

## 🏃 Quick Start

### Option 1: Google Colab (Easiest)
1. Click any notebook link above
2. Click "Open in Colab" button
3. Add your OpenAI API key
4. Run all cells

### Option 2: Local Jupyter
```bash
# Install Jupyter
pip install jupyter notebook

# Install dependencies
pip install sec-edgar-langchain langchain-openai

# Start Jupyter
jupyter notebook

# Open any notebook from this folder
```

### Option 3: VS Code
1. Install Python extension
2. Open any `.ipynb` file
3. Select Python kernel
4. Run cells interactively

## 🔑 API Keys Required

You'll need:
- **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
- Set in notebook: `os.environ["OPENAI_API_KEY"] = "sk-..."`

## 📈 Use Cases

| Notebook | Use Case | Time to Run |
|----------|----------|-------------|
| Quickstart | Earnings analysis | 2-3 minutes |
| Financial Analysis | Deep dive research | 10-15 minutes |
| Portfolio Monitoring | Track 10+ stocks | 5-10 minutes |
| Insider Trading | Sentiment analysis | 3-5 minutes |
| Material Events | News monitoring | 2-3 minutes |

## 💡 Tips

1. **Start with Quickstart** - Gets you running in under 5 minutes
2. **Use GPT-4** - More accurate financial analysis
3. **Cache Results** - Save API calls by storing results
4. **Batch Queries** - Process multiple companies efficiently

## 📝 Contributing

Have a cool analysis workflow? Submit a PR with your notebook!

## 📄 License

AGPL-3.0 - See [LICENSE](../../LICENSE)