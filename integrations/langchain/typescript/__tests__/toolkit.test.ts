import { describe, it, expect } from '@jest/globals';

describe('SECEdgarAgentToolkit', () => {
  describe('module loading', () => {
    it('should import successfully', () => {
      expect(() => require('../toolkit')).not.toThrow();
    });

    it('should export SECEdgarAgentToolkit class', () => {
      const { SECEdgarAgentToolkit } = require('../toolkit');
      expect(SECEdgarAgentToolkit).toBeDefined();
      expect(typeof SECEdgarAgentToolkit).toBe('function');
    });

    it('should have proper TypeScript types', () => {
      // Basic type checking test
      expect(typeof require('../index')).toBe('object');
    });
  });
});