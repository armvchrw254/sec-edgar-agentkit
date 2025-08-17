import { describe, it, expect } from '@jest/globals';
import { SECEdgarAgentToolkit } from '../toolkit';

// Set shorter timeout to prevent hanging
jest.setTimeout(10000);

describe('Integration Tests', () => {
  describe('LangChain Tool Integration', () => {
    it('should create tools with proper LangChain structure', () => {
      const toolkit = new SECEdgarAgentToolkit({
        userAgent: 'TestApp/1.0 (test@example.com)'
      });
      
      const tools = toolkit.getTools();
      const firstTool = tools[0];
      
      // Check that tools have required LangChain properties
      expect(firstTool).toHaveProperty('name');
      expect(firstTool).toHaveProperty('description');
      expect(firstTool).toHaveProperty('schema');
      expect(firstTool).toHaveProperty('call');
      expect(typeof firstTool.call).toBe('function');
    });

    it('should export proper module structure', () => {
      const module = require('../index');
      expect(module).toHaveProperty('SECEdgarAgentToolkit');
      expect(typeof module.SECEdgarAgentToolkit).toBe('function');
    });

    it('should handle configuration validation', () => {
      // Should not throw with valid configuration
      expect(() => {
        new SECEdgarAgentToolkit({
          userAgent: 'TestApp/1.0 (test@example.com)',
          configuration: {
            actions: {
              companies: {
                lookupCIK: true
              }
            }
          }
        });
      }).not.toThrow();
    });
  });
});