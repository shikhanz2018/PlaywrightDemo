module.exports = {
  default: {
    require: ['tests/steps/*.ts', 'support/hooks.ts'], // Include step definitions and hooks
    paths: ['tests/features/*.feature'], // Path to feature files
    "format": [
      "allure-cucumberjs/reporter",
      "node_modules/cucumber-allure-formatter",
    ],
    parallel: 1,
    requireModule: ['ts-node/register'], // Use ts-node to transpile TypeScript
    formats: ['json:allure-results/cucumber.json'], // Output in JSON format for Allure
  },
};
