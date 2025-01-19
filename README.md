"# Marvelautomation" 

Playwright-Cucumber Testing Framework
A robust end-to-end testing framework using Playwright and Cucumber. This setup provides a behavior-driven development (BDD) approach for testing modern web applications.

Features
BDD support with Cucumber.
Cross-browser testing using Playwright.
TypeScript for robust and type-safe tests.
Simple setup and easy to extend.

Getting Started
Follow these instructions to set up and run the project locally.

1. Clone the Repository
Clone the repository to your local machine:
git clone https://github.com/shikhanz2018/Marvelautomation.git
cd <your-repo-name>

2. Install Dependencies
Run the following command to install the required dependencies:
npm install

3. Install TypeScript and Dev Dependencies
Install TypeScript, ts-node, and node types for development:
npm install ts-node @types/node --save-dev

4. Install Playwright, Cucumber, and Chai
Run the following to install Playwright, Cucumber, and Chai:
npm install playwright @cucumber/cucumber @playwright/test chai

5. Install Playwright Browsers
Playwright requires specific browser binaries. Install them using:
npx playwright install


Project Structure
The project is organized as follows:
.tests
├── features/
│   ├── marvelDashBoard.feature          # Cucumber feature file
 ── steps/
│       └── marvelautomatedstep.ts     # Step definitions
├                
├── cucumber.tsconfig.json          # TypeScript config for Cucumber
├── playwright.config.ts            # Playwright config file
├── package.json                    # Project dependencies and scripts
├── README.md                       # Documentation
└── tsconfig.json                   # TypeScript config file


6. Run all feature scenarios 
npx cucumber-js

7. Run specific scenarios with tags ---@freeze
npx cucumber-js --tags "@freeze" --require tests/steps/*.ts --require-module ts-node/register --format @cucumber/pretty-formatter tests/features/*.feature