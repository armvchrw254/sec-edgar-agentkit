import { describe, it, expect } from '@jest/globals';
import { SECEdgarAgentToolkit } from '../toolkit';

describe('Integration Tests', () => {
  describe('LangChain Integration', () => {
    it('should create toolkit with all tools', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });

      const tools = toolkit.getTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Check tool names
      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).toContain('sec_edgar_company_info');
      expect(toolNames).toContain('sec_edgar_filing_search');
    });

    it('should respect configuration', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            companies: {
              lookupCIK: true,
              getInfo: false
            },
            financial: {
              getStatements: false,
              parseXBRL: false
            }
          }
        }
      });

      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).not.toContain('sec_edgar_company_info');
      expect(toolNames).not.toContain('sec_edgar_financial_statements');
    });

    it('should have all 10 tools when fully configured', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            companies: {
              lookupCIK: true,
              getInfo: true,
              getFacts: true
            },
            filings: {
              search: true,
              getContent: true,
              analyze8K: true,
              extractSection: true
            },
            financial: {
              getStatements: true,
              parseXBRL: true
            },
            insiderTrading: {
              analyzeTransactions: true
            }
          }
        }
      });

      const toolNames = toolkit.getToolNames();
      expect(toolNames.length).toBe(10);
      
      // Check all tools are present
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).toContain('sec_edgar_company_info');
      expect(toolNames).toContain('sec_edgar_company_facts');
      expect(toolNames).toContain('sec_edgar_filing_search');
      expect(toolNames).toContain('sec_edgar_filing_content');
      expect(toolNames).toContain('sec_edgar_analyze_8k');
      expect(toolNames).toContain('sec_edgar_extract_section');
      expect(toolNames).toContain('sec_edgar_financial_statements');
      expect(toolNames).toContain('sec_edgar_xbrl_parse');
      expect(toolNames).toContain('sec_edgar_insider_trading');
    });
  });
});