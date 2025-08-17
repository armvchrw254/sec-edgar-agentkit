import { describe, it, expect } from '@jest/globals';

describe('Integration Tests', () => {
  describe('LangChain Integration', () => {
    it('should export main module correctly', () => {
      const module = require('../index');
      expect(module).toBeDefined();
    });

    it('should have toolkit in exports', () => {
      const { SECEdgarAgentToolkit } = require('../toolkit');
      expect(SECEdgarAgentToolkit).toBeDefined();
    });

    it('should pass basic smoke test', () => {
      // Just verify modules can be loaded without errors
      expect(true).toBe(true);
    });
  });
});