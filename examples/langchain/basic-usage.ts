import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SECEdgarAgentToolkit } from '../integrations/langchain';

async function main() {
  // Initialize the SEC EDGAR toolkit
  const secEdgarToolkit = new SECEdgarAgentToolkit({
    mcpServerUrl: 'sec-edgar-mcp', // Path to the MCP server
    configuration: {
      actions: {
        companies: {
          lookupCIK: true,
          getInfo: true,
          getFacts: true,
        },
        filings: {
          search: true,
          getContent: true,
          analyze8K: true,
        },
        financial: {
          getStatements: true,
          parseXBRL: true,
        },
        insiderTrading: {
          analyzeTransactions: true,
        },
      },
    },
  });

  // Connect to the MCP server
  await secEdgarToolkit.connect();

  // Initialize the LLM
  const llm = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  });

  // Get tools from the toolkit
  const tools = secEdgarToolkit.getTools();

  // Create the agent prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful financial analyst assistant with access to SEC EDGAR data. Use the available tools to answer questions about companies, their filings, and financial information.'],
    ['human', '{input}'],
    ['assistant', '{agent_scratchpad}'],
  ]);

  // Create the agent
  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt,
  });

  // Create the agent executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  // Example queries
  const queries = [
    "What is Apple's CIK and latest 10-K filing?",
    "Show me Microsoft's revenue for the last 3 years",
    "What were the key items in Tesla's latest 8-K filing?",
    "Analyze insider trading activity for Amazon in the last quarter",
  ];

  for (const query of queries) {
    console.log(`\n\nQuery: ${query}`);
    console.log('='.repeat(50));
    
    try {
      const result = await agentExecutor.invoke({
        input: query,
      });
      
      console.log('Result:', result.output);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Disconnect from the MCP server
  await secEdgarToolkit.disconnect();
}

// Run the example
main().catch(console.error);