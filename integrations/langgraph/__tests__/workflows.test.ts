import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { AnalysisState } from '../src/types';
import { HumanMessage } from '@langchain/core/messages';

jest.setTimeout(30000);

describe('SEC EDGAR LangGraph Workflows', () => {
  describe('Types', () => {
    it('should define AnalysisState interface correctly', () => {
      const state: AnalysisState = {
        messages: [],
        companies: [],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: [],
        errors: [],
        currentStep: 'start',
        nextSteps: []
      };

      expect(state).toBeDefined();
      expect(Array.isArray(state.messages)).toBe(true);
      expect(Array.isArray(state.companies)).toBe(true);
      expect(Array.isArray(state.filings)).toBe(true);
      expect(Array.isArray(state.financialData)).toBe(true);
      expect(typeof state.comparisons).toBe('object');
      expect(Array.isArray(state.insights)).toBe(true);
      expect(Array.isArray(state.errors)).toBe(true);
      expect(typeof state.currentStep).toBe('string');
      expect(Array.isArray(state.nextSteps)).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should create proper initial state structure', () => {
      const initialState: AnalysisState = {
        messages: [],
        companies: [],
        filings: [],
        financialData: [],
        comparisons: {},
        insights: [],
        errors: [],
        currentStep: 'start',
        nextSteps: []
      };

      expect(initialState.messages).toEqual([]);
      expect(initialState.companies).toEqual([]);
      expect(initialState.insights).toEqual([]);
      expect(initialState.errors).toEqual([]);
      expect(initialState.currentStep).toBe('start');
    });
  });
});