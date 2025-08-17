import { describe, it, expect } from 'bun:test';
import { SECEdgarAgentToolkit } from '../toolkit';

describe('SECEdgarAgentToolkit', () => {
  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });

      const tools = toolkit.getTools();
      expect(tools.length).toBeGreaterThan(0);
      
      // Should include all tools by default
      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).toContain('sec_edgar_company_info');
      expect(toolNames).toContain('sec_edgar_filing_search');
      expect(toolNames).toContain('sec_edgar_financial_statements');
      expect(toolNames).toContain('sec_edgar_insider_trading');
    });

    it('should respect configuration to disable tools', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            companies: {
              lookupCIK: true,
              getInfo: false,
              getFacts: false
            },
            filings: false,
            financial: false,
            insiderTrading: false
          }
        }
      });

      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).not.toContain('sec_edgar_company_info');
      expect(toolNames).not.toContain('sec_edgar_filing_search');
      expect(toolNames).not.toContain('sec_edgar_financial_statements');
    });
  });

  describe('tool access', () => {
    it('should get tool by name', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });

      const tool = toolkit.getTool('sec_edgar_cik_lookup');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('sec_edgar_cik_lookup');
    });

    it('should return undefined for non-existent tool', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });

      const tool = toolkit.getTool('non_existent_tool');
      expect(tool).toBeUndefined();
    });
  });

  describe('tool schemas', () => {
    it('should have correct schema for CIK lookup tool', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            companies: { lookupCIK: true }
          }
        }
      });

      const tool = toolkit.getTool('sec_edgar_cik_lookup');
      expect(tool).toBeDefined();
      expect(tool?.description).toContain('CIK');
      
      // Test the schema has the expected structure
      const schema = tool?.schema;
      expect(schema).toBeDefined();
    });

    it('should have correct schema for filing search tool', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            filings: { search: true }
          }
        }
      });

      const tool = toolkit.getTool('sec_edgar_filing_search');
      expect(tool).toBeDefined();
      expect(tool?.description).toContain('Search for filings');
    });
  });
});