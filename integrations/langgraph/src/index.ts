import { StateGraph, END, Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { AnalysisState, CompanyData, FilingType } from './types';
import {
  lookupCompanies,
  fetchFilings,
  extractFinancials,
  analyzeTrends,
  generateReport,
  handle8KEvents,
  analyzeInsiderTrading
} from './nodes';
import { HumanMessage } from '@langchain/core/messages';

export * from './types';
export * from './nodes';

// Define the state using Annotation
const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  companies: Annotation<CompanyData[]>({
    reducer: (x, y) => y || x,
    default: () => []
  }),
  filings: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  financialData: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  comparisons: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({})
  }),
  insights: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  errors: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  currentStep: Annotation<string>({
    reducer: (x, y) => y || x,
    default: () => 'start'
  }),
  nextSteps: Annotation<string[]>({
    reducer: (x, y) => y || x,
    default: () => []
  })
});

export function createFinancialAnalysisWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode('lookup_companies', lookupCompanies)
    .addNode('fetch_filings', fetchFilings)
    .addNode('extract_financials', extractFinancials)
    .addNode('analyze_trends', analyzeTrends)
    .addNode('generate_report', generateReport)
    .addEdge('__start__', 'lookup_companies')
    .addEdge('lookup_companies', 'fetch_filings')
    .addEdge('fetch_filings', 'extract_financials')
    .addEdge('extract_financials', 'analyze_trends')
    .addEdge('analyze_trends', 'generate_report')
    .addEdge('generate_report', '__end__');

  return workflow.compile();
}

export function createComprehensiveAnalysisWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode('lookup_companies', lookupCompanies)
    .addNode('fetch_filings', fetchFilings)
    .addNode('extract_financials', extractFinancials)
    .addNode('analyze_trends', analyzeTrends)
    .addNode('analyze_8k_events', handle8KEvents)
    .addNode('analyze_insider_trading', analyzeInsiderTrading)
    .addNode('generate_report', generateReport);

  workflow.addEdge('__start__', 'lookup_companies');
  workflow.addEdge('lookup_companies', 'fetch_filings');
  
  workflow.addConditionalEdges(
    'fetch_filings',
    async (state) => {
      if (state.filings.length === 0) {
        return 'generate_report';
      }
      return 'extract_financials';
    },
    {
      'extract_financials': 'extract_financials',
      'generate_report': 'generate_report'
    }
  );

  workflow.addEdge('extract_financials', 'analyze_trends');
  workflow.addEdge('analyze_trends', 'analyze_8k_events');
  workflow.addEdge('analyze_8k_events', 'analyze_insider_trading');
  workflow.addEdge('analyze_insider_trading', 'generate_report');
  workflow.addEdge('generate_report', '__end__');

  return workflow.compile();
}

export function createEventMonitoringWorkflow() {
  const workflow = new StateGraph(GraphState)
    .addNode('lookup_companies', lookupCompanies)
    .addNode('analyze_8k_events', handle8KEvents)
    .addNode('analyze_insider_trading', analyzeInsiderTrading)
    .addNode('generate_report', generateReport)
    .addEdge('__start__', 'lookup_companies')
    .addEdge('lookup_companies', 'analyze_8k_events')
    .addEdge('analyze_8k_events', 'analyze_insider_trading')
    .addEdge('analyze_insider_trading', 'generate_report')
    .addEdge('generate_report', '__end__');

  return workflow.compile();
}

export async function runFinancialAnalysis(
  companies: string[],
  options?: {
    filingType?: FilingType;
    yearsBack?: number;
  }
) {
  const workflow = createFinancialAnalysisWorkflow();
  
  const initialState = {
    messages: [new HumanMessage(`Analyze financial performance of: ${companies.join(', ')}`)],
    companies: companies.map(ticker => ({ ticker })),
    filings: [],
    financialData: [],
    comparisons: {},
    insights: [],
    errors: [],
    currentStep: 'start',
    nextSteps: ['lookup_companies']
  };

  const result = await workflow.invoke(initialState);
  return result;
}

export async function runComprehensiveAnalysis(
  companies: string[],
  options?: {
    includeInsiderTrading?: boolean;
    include8K?: boolean;
  }
) {
  const workflow = createComprehensiveAnalysisWorkflow();
  
  const initialState = {
    messages: [new HumanMessage(`Comprehensive analysis of: ${companies.join(', ')}`)],
    companies: companies.map(ticker => ({ ticker })),
    filings: [],
    financialData: [],
    comparisons: {},
    insights: [],
    errors: [],
    currentStep: 'start',
    nextSteps: ['lookup_companies']
  };

  const result = await workflow.invoke(initialState);
  return result;
}

export async function monitorEvents(
  companies: string[],
  options?: {
    checkInterval?: number;
  }
) {
  const workflow = createEventMonitoringWorkflow();
  
  const initialState = {
    messages: [new HumanMessage(`Monitor events for: ${companies.join(', ')}`)],
    companies: companies.map(ticker => ({ ticker })),
    filings: [],
    financialData: [],
    comparisons: {},
    insights: [],
    errors: [],
    currentStep: 'start',
    nextSteps: ['lookup_companies']
  };

  const result = await workflow.invoke(initialState);
  return result;
}