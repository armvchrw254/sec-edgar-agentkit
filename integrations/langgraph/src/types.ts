import { BaseMessage } from '@langchain/core/messages';
import { z } from 'zod';

export const FilingTypeSchema = z.enum(['10-K', '10-Q', '8-K', '20-F', 'DEF 14A', 'S-1', 'ALL']);
export type FilingType = z.infer<typeof FilingTypeSchema>;

export const AnalysisMetricSchema = z.enum([
  'revenue',
  'net_income',
  'gross_margin',
  'operating_margin',
  'eps',
  'cash_flow',
  'debt_to_equity',
  'roe',
  'roa'
]);
export type AnalysisMetric = z.infer<typeof AnalysisMetricSchema>;

export interface CompanyData {
  ticker: string;
  cik?: string;
  name?: string;
}

export interface Filing {
  accessionNumber: string;
  filingDate: string;
  reportDate?: string;
  form: string;
  filedAt: string;
  fileUrl: string;
  content?: string;
  extractedData?: Record<string, any>;
  company?: string;
}

export interface FinancialMetrics {
  company: string;
  period: string;
  metrics: Record<string, number | null>;
}

export interface AnalysisState {
  messages: BaseMessage[];
  companies: CompanyData[];
  filings: Filing[];
  financialData: FinancialMetrics[];
  comparisons: Record<string, any>;
  insights: string[];
  errors: string[];
  currentStep: string;
  nextSteps: string[];
}