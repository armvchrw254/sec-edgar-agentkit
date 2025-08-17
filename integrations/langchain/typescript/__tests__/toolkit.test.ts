import { describe, it, expect, beforeEach } from '@jest/globals';
import { SECEdgarAgentToolkit } from '../toolkit';

// Set shorter timeout to prevent hanging
jest.setTimeout(10000);

describe('SECEdgarAgentToolkit', () => {
  describe('Basic functionality', () => {
    it('should create toolkit instance with minimal config', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });
      
      expect(toolkit).toBeInstanceOf(SECEdgarAgentToolkit);
    });

    it('should return array of tools', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });
      
      const tools = toolkit.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should return tool names', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });
      
      const toolNames = toolkit.getToolNames();
      expect(Array.isArray(toolNames)).toBe(true);
      expect(toolNames.length).toBeGreaterThan(0);
      expect(toolNames).toContain('sec_edgar_cik_lookup');
    });

    it('should respect disabled tool configuration', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)',
        configuration: {
          actions: {
            companies: {
              lookupCIK: true,
              getInfo: false,
              getFacts: false
            }
          }
        }
      });
      
      const toolNames = toolkit.getToolNames();
      expect(toolNames).toContain('sec_edgar_cik_lookup');
      expect(toolNames).not.toContain('sec_edgar_company_info');
    });
  });
});