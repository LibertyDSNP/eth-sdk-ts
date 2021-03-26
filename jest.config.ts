// jest.config.ts
import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
};
// This prevents jest from running compiled js
// apparently it's not enough to set test root as <rootDir>/src
module.exports = {
  moduleFileExtensions: ["ts", "js", "json"],
  preset: 'ts-jest',
  roots: ["<rootDir>/src"],
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/node_modules/", ".js"],
  testResultsProcessor: "jest-junit",
  transform: {"^.+\\.(ts|tsx)$": "ts-jest"},
  testMatch: ["**/*.test.(ts|js)"],
};

export default config;

