module.exports = {
  displayName: 'langchain',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'typescript',
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageDirectory: '../../../coverage/integrations/langchain',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: './tsconfig.json'
    }]
  }
};