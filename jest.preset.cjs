const { default: nxPreset } = require('@nx/jest/preset');

module.exports = {
  ...nxPreset,
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.test.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**'
  ]
};