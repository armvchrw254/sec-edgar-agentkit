module.exports = {
  displayName: 'mcp-use',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: false }],
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  coverageDirectory: '../../coverage/integrations/mcp-use'
};