/**
 * SEC EDGAR LangChain Demo
 * 
 * This example shows how to use the SEC EDGAR toolkit with LangChain.js
 * to analyze financial data using AI agents.
 */

import { SECEdgarAgentToolkit } from '@sec-edgar-agentkit/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

// Set your OpenAI API key
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';

async function main() {
  console.log('🚀 SEC EDGAR LangChain Demo\n');

  // Initialize the SEC EDGAR toolkit
  const toolkit = new SECEdgarAgentToolkit({
    userAgent: 'FinancialAnalystDemo/1.0 (demo@example.com)',
    configuration: {
      actions: {
        companies: { lookupCIK: true, getInfo: true, getFacts: true },
        filings: { search: true, getContent: true, analyze8K: true },
        financial: { getStatements: true, parseXBRL: true },
        insiderTrading: { analyzeTransactions: true }
      }
    }
  });

  // Get tools
  const tools = toolkit.getTools();
  console.log(`✅ Loaded ${tools.length} SEC EDGAR tools\n`);

  // Initialize LLM
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0
  });

  // Create prompt
  const systemPrompt = `You are a Senior Financial Analyst with expertise in SEC filings analysis.
  You have access to real-time SEC EDGAR data.
  
  Always:
  1. Look up company CIK first for accurate data
  2. Pull recent filings (10-K, 10-Q, 8-K)
  3. Analyze metrics and trends with specific numbers
  4. Check material events and insider trading
  5. Cite specific filing dates and form types`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad')
  ]);

  // Create agent
  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt
  });

  // Create executor
  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 10
  });

  // Example 1: Earnings Analysis
  console.log('📊 Example 1: Earnings Analysis\n');
  console.log('Query: "What is NVIDIA\'s latest quarterly revenue?"\n');
  
  const earningsResult = await executor.invoke({
    input: "What is NVIDIA's latest quarterly revenue and how does it compare to last year?"
  });
  
  console.log('Result:', earningsResult.output);
  console.log('\n' + '='.repeat(60) + '\n');

  // Example 2: Insider Trading
  console.log('💼 Example 2: Insider Trading Analysis\n');
  console.log('Query: "Check Tesla insider trading activity"\n');
  
  const insiderResult = await executor.invoke({
    input: "Analyze Tesla (TSLA) insider trading activity in the last 30 days"
  });
  
  console.log('Result:', insiderResult.output);
  console.log('\n' + '='.repeat(60) + '\n');

  // Example 3: Company Comparison
  console.log('⚔️ Example 3: Competitive Analysis\n');
  console.log('Query: "Compare Apple vs Microsoft financials"\n');
  
  const comparisonResult = await executor.invoke({
    input: "Compare Apple (AAPL) vs Microsoft (MSFT) latest revenues and profit margins"
  });
  
  console.log('Result:', comparisonResult.output);
}

// Advanced: Custom Analysis Function
export async function analyzeEarnings(
  executor: AgentExecutor,
  ticker: string,
  companyName: string
): Promise<{
  ticker: string;
  company: string;
  analysis: string;
  timestamp: string;
}> {
  const query = `
    Analyze ${companyName} (${ticker}) earnings:
    1. Latest quarterly revenue, net income, EPS
    2. Year-over-year growth rates
    3. Recent 8-K material events
    4. Insider trading sentiment (last 30 days)
    5. Key risks from latest 10-Q
  `;
  
  const result = await executor.invoke({ input: query });
  
  return {
    ticker,
    company: companyName,
    analysis: result.output,
    timestamp: new Date().toISOString()
  };
}

// Portfolio Analysis
export async function analyzePortfolio(
  executor: AgentExecutor,
  portfolio: Array<{ ticker: string; name: string }>
): Promise<Array<{ ticker: string; company: string; summary: string }>> {
  const results = [];
  
  for (const company of portfolio) {
    const query = `Get ${company.name} (${company.ticker}) latest revenue and profit margin. Is it profitable?`;
    const result = await executor.invoke({ input: query });
    
    results.push({
      ticker: company.ticker,
      company: company.name,
      summary: result.output.substring(0, 200) + '...'
    });
  }
  
  return results;
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}