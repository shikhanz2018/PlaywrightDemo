module.exports = {
  default: {
    require: ['tests/steps/*.ts'], // Include step definitions
    paths: ['tests/features/*.feature'], // Path to feature files
    format: [
      '@cucumber/pretty-formatter', // To pretty print output
      'allure-cucumberjs/reporter' // Allure reporter for Cucumber
    ],
    parallel: 1,
    requireModule: ['ts-node/register'], // Use ts-node to transpile TypeScript
    formats: ['json:allure-results/cucumber.json'], // Output in JSON format for Allure
  },
};
