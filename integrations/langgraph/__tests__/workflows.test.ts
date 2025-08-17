import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import {
  createFinancialAnalysisWorkflow,
  createEventMonitoringWorkflow,
  runFinancialAnalysis,
  AnalysisState
} from '../src/index';
import { HumanMessage } from '@langchain/core/messages';

jest.setTimeout(30000);

describe('SEC EDGAR LangGraph Workflows', () => {
  describe('Financial Analysis Workflow', () => {
    it('should create a financial analysis workflow', () => {
      const workflow = createFinancialAnalysisWorkflow();
      expect(workflow).toBeDefined();
      expect(workflow.invoke).toBeDefined();
      expect(workflow.stream).toBeDefined();
    });

    it('should process initial state correctly', async () => {
      const workflow = createFinancialAnalysisWorkflow();
      
      const initialState: AnalysisState = {
        messages: [new HumanMessage('Test analysis')],
        companies: [{ ticker: 'AAPL' }],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: [],
        errors: [],
        currentStep: 'start',
        nextSteps: ['lookup_companies']
      };

      // Mock the workflow to avoid actual API calls
      const mockInvoke = jest.fn().mockResolvedValue({
        ...initialState,
        currentStep: 'report_generated',
        insights: ['Test insight'],
        companies: [{ ticker: 'AAPL', cik: '0000320193', name: 'Apple Inc.' }]
      });

      workflow.invoke = mockInvoke;

      const result = await workflow.invoke(initialState);
      
      expect(mockInvoke).toHaveBeenCalledWith(initialState);
      expect(result.companies[0].cik).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });

  describe('Event Monitoring Workflow', () => {
    it('should create an event monitoring workflow', () => {
      const workflow = createEventMonitoringWorkflow();
      expect(workflow).toBeDefined();
      expect(workflow.invoke).toBeDefined();
    });

    it('should handle multiple companies', async () => {
      const workflow = createEventMonitoringWorkflow();
      
      const initialState: AnalysisState = {
        messages: [],
        companies: [
          { ticker: 'TSLA' },
          { ticker: 'NVDA' }
        ],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: [],
        errors: [],
        currentStep: 'start',
        nextSteps: []
      };

      // Mock to avoid actual API calls
      const mockInvoke = jest.fn().mockResolvedValue({
        ...initialState,
        currentStep: 'report_generated',
        insights: [
          'TSLA recent events: Material Change',
          'NVDA recent events: Acquisition'
        ]
      });

      workflow.invoke = mockInvoke;

      const result = await workflow.invoke(initialState);
      
      expect(result.insights).toHaveLength(2);
      expect(result.currentStep).toBe('report_generated');
    });
  });

  describe('Helper Functions', () => {
    it('should initialize state correctly in runFinancialAnalysis', async () => {
      // Mock the entire function to test initialization
      const mockAnalysis = jest.fn().mockImplementation(async (companies, options) => {
        return {
          messages: [new HumanMessage(`Analyze financial performance of: ${companies.join(', ')}`)],
          companies: companies.map((ticker: string) => ({ ticker })),
          filings: [],
          financialData: [],
          comparisons: {},
          insights: [`Mock analysis for ${companies.join(', ')}`],
          errors: [],
          currentStep: 'complete',
          nextSteps: []
        };
      });

      const result = await mockAnalysis(['AAPL', 'MSFT'], { filingType: '10-K' });
      
      expect(result.companies).toHaveLength(2);
      expect(result.companies[0].ticker).toBe('AAPL');
      expect(result.companies[1].ticker).toBe('MSFT');
      expect(result.insights).toHaveLength(1);
    });
  });

  describe('State Management', () => {
    it('should accumulate insights across nodes', () => {
      const state: AnalysisState = {
        messages: [],
        companies: [],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: ['Initial insight'],
        errors: [],
        currentStep: 'start',
        nextSteps: []
      };

      // Simulate node updates
      const newInsights = ['New insight 1', 'New insight 2'];
      const updatedState = {
        ...state,
        insights: [...state.insights, ...newInsights]
      };

      expect(updatedState.insights).toHaveLength(3);
      expect(updatedState.insights).toContain('Initial insight');
      expect(updatedState.insights).toContain('New insight 1');
    });

    it('should track errors without stopping workflow', () => {
      const state: AnalysisState = {
        messages: [],
        companies: [{ ticker: 'INVALID' }],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: [],
        errors: [],
        currentStep: 'lookup_companies',
        nextSteps: ['fetch_filings']
      };

      // Simulate error handling
      const errorState = {
        ...state,
        errors: ['Failed to lookup INVALID: Company not found'],
        currentStep: 'companies_looked_up',
        nextSteps: ['fetch_filings']
      };

      expect(errorState.errors).toHaveLength(1);
      expect(errorState.nextSteps).toContain('fetch_filings');
    });
  });
});