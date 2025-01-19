module.exports = {
  default: {
    require: ['tests/steps/*.ts'],
    paths: ['tests/features/*.feature'],
    format: ['@cucumber/pretty-formatter'],
    parallel: 1,
    requireModule: ['ts-node/register'],
    format: [
      "allure-cucumberjs/reporter"
    ],
    formats: ['json:allure-results/cucumber.json'],
  },
};
