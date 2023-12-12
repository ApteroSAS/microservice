/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //testEnvironment: 'jest-environment-jsdom',
  //setupFiles: ['jest-canvas-mock'],
  // Add the testMatch property
  testMatch: [
    '<rootDir>/src/**/*.(spec|test).[tj]s?(x)',// Specifically matches .test.ts files anywhere in the src directory
    'src/**/*.(spec|test).[tj]s?(x)'// for docker
  ],
  moduleNameMapper: {
    '^@root/(.*)$': '<rootDir>/src/$1'
  },
};
