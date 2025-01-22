# PlaywrightDemo

**Playwright-Cucumber Testing Framework**  
A robust end-to-end testing framework using Playwright and Cucumber. This setup provides a behavior-driven development (BDD) approach for testing modern web applications.  

---

## Features
- BDD support with Cucumber.
- Cross-browser testing using Playwright.
- TypeScript for robust and type-safe tests.
- Simple setup and easy to extend.

---

## Getting Started
Follow these instructions to set up and run the project locally.  

### 1. Clone the Repository
Clone the repository to your local machine:  
```bash
git clone https://github.com/shikhanz2018/PlaywrightDemo
cd PlaywrightDemo
```

### 2. Install Dependencies
Run the following command to install the required dependencies:  
```bash
npm install  
```

### 3. Install TypeScript and Dev Dependencies
Install TypeScript, `ts-node`, and Node.js types for development:  
```bash
npm install ts-node @types/node --save-dev  
```

### 4. Install Playwright, Cucumber, and Chai
Run the following to install Playwright, Cucumber, and Chai:  
```bash
npm install playwright @cucumber/cucumber @playwright/test chai  
```

### 5. Install Playwright Browsers
Playwright requires specific browser binaries. Install them using:  
```bash
npx playwright install  
```

---

## Project Structure
The project is organized as follows:  
```plaintext
.tests/  
├── features/  
│   └── suncorphomePage.feature          # Cucumber feature file  
├── steps/  
│   └── suncorphomePageStep.ts           # Step definitions  
|-  pages
├── cucumber.js                          # TypeScript config for Cucumber

├── playwright.config.ts                 # Playwright config file  
├── package.json                         # Project dependencies and scripts  
├── README.md                            # Documentation  
└── tsconfig.json                        # TypeScript config file  
```

---

## Running Tests

### 6. Run All Feature Scenarios
```bash
npx cucumber-js  
```

### 7. Run Specific Scenarios with Tags
For example, to run scenarios tagged with `@freeze`:  
```bash
npx cucumber-js --format allure-cucumberjs/reporter --tags "@suncorplaunch" --require tests/steps/*.ts --require-module ts-node/register tests/features/*.feature  
```

---

## Reporting with Allure

### 8. Install Allure-CucumberJS
Install `allure-cucumberjs` using a package manager:  
```bash
npm install -D allure-cucumberjs  
```

### Usage
Enable the `allure-cucumberjs/reporter` formatter in the Cucumber.js configuration file:  
```json
{
  "default": {
    "format": [
      "allure-cucumberjs/reporter"
    ]
  }
}
```

Alternatively, specify the formatter via the CLI:  
```bash
npx cucumber-js --format allure-cucumberjs/reporter  
```

npx cucumber-js --format allure-cucumberjs/reporter --tags "@suncorplaunch" --require tests/steps/*.ts --require-module ts-node/register tests/features/*.feature

When the test run completes, the result files will be generated in the `./allure-results` directory.  

---

### Viewing the Report
You need Allure Report installed on your machine to generate and open the report. Follow the [installation instructions](https://allurereport.org/docs/install/).  

#### Generate Allure Report
```bash
allure generate ./allure-results -o ./allure-report  
```

#### Open the Report
```bash
allure open ./allure-report  
```

