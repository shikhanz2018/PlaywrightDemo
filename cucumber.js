module.exports = {
  default: {
    require: ['tests/steps/*.ts'], // Path to step definitions
    paths: ['tests/features/*.feature'], // Path to feature files
    format: ['@cucumber/pretty-formatter'], // Use the pretty formatter
    parallel: 1, // Run scenarios sequentially
    requireModule: ['ts-node/register'], // Enable TypeScript support
  },
};
