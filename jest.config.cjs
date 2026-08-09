/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  // Source files use nodenext-style relative imports with an explicit
  // ".ts" or ".js" extension (e.g. "../services/cart.service.ts" or
  // "../models/order.model.js"), which ts-jest's CommonJS output does not
  // rewrite. Strip the extension so Jest resolves the actual .ts source.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.(js|ts)$": "$1",
    // "uuid" (v14) ships ESM-only with no CommonJS build, which ts-jest's
    // CJS output can't require(). Swap in a tiny CommonJS-safe stand-in.
    "^uuid$": "<rootDir>/src/__tests__/__mocks__/uuid.ts",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
};
