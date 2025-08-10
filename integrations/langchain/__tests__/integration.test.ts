import { SECEdgarAgentToolkit } from '../toolkit';

describe('Integration Tests', () => {
  describe('LangChain Integration', () => {
    it('should create toolkit with all tools', () => {
      const toolkit = new SECEdgarAgentToolkit({
        mcpServerUrl: 'test-server'
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
        mcpServerUrl: 'test-server',
        configuration: {
          actions: {
            companies: {
              lookupCIK: true,
              getInfo: false
            },
            financial: false
          }
        }
      });

      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).not.toContain('sec_edgar_company_info');
      expect(toolNames).not.toContain('sec_edgar_financial_statements');
    });
  });
});