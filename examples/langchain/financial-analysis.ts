import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SECEdgarAgentToolkit } from '../integrations/langchain';

async function financialAnalysisExample() {
  // Initialize toolkit with specific configuration for financial analysis
  const toolkit = new SECEdgarAgentToolkit({
    mcpServerUrl: 'sec-edgar-mcp',
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
        },
        financial: {
          getStatements: true,
          parseXBRL: true,
        },
      },
      context: {
        maxFilings: 5,
        includeRawData: true,
      },
    },
  });

  await toolkit.connect();

  const llm = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0,
  });

  const tools = toolkit.getTools();

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are an expert financial analyst specializing in SEC filings analysis. 
    You have access to tools that can retrieve and analyze SEC EDGAR data.
    When analyzing financials:
    1. Always start by looking up the company's CIK
    2. Retrieve relevant financial statements
    3. Use XBRL parsing for precise numerical data
    4. Provide insights based on the data
    
    Format your responses with clear sections and use tables where appropriate.`],
    ['human', '{input}'],
    ['assistant', '{agent_scratchpad}'],
  ]);

  const agent = await createStructuredChatAgent({
    llm,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
    maxIterations: 10,
  });

  // Complex financial analysis query
  const analysisQuery = `
    Perform a comprehensive financial analysis of NVIDIA (NVDA):
    1. Get their latest 10-K and 10-Q filings
    2. Extract key financial metrics: revenue, net income, gross margin
    3. Compare year-over-year growth rates
    4. Identify any significant risks mentioned in the filings
    5. Summarize the company's financial health
  `;

  console.log('Starting Financial Analysis...');
  console.log('Query:', analysisQuery);
  console.log('='.repeat(80));

  try {
    const result = await executor.invoke({
      input: analysisQuery,
    });

    console.log('\\nAnalysis Result:');
    console.log(result.output);
  } catch (error) {
    console.error('Analysis failed:', error);
  }

  await toolkit.disconnect();
}

// Run the financial analysis example
financialAnalysisExample().catch(console.error);