import { AfterStep, Before, After, Status } from "@cucumber/cucumber";
import { Page, Browser, chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

// Global variables
let browser: Browser;
export let page: Page;
let homePage;

const allureResultsDir = path.join(process.cwd(), "allure-results");
const screenshotsDir = path.join(allureResultsDir, "screenshots");

// Function to clean the entire allure-results folder
const cleanAllureResultsFolder = () => {
  if (fs.existsSync(allureResultsDir)) {
    const files = fs.readdirSync(allureResultsDir);
    files.forEach((file) => {
      const filePath = path.join(allureResultsDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        // Remove the directory and all its contents
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        // Remove the file
        fs.unlinkSync(filePath);
      }
    });
    console.log("Allure results folder cleaned.");
  } else {
    console.log("Allure results folder does not exist, no cleaning needed.");
  }
};

// Function to clean the screenshots folder
const cleanScreenshotsFolder = () => {
  if (fs.existsSync(screenshotsDir)) {
    const files = fs.readdirSync(screenshotsDir);
    files.forEach((file) => {
      const filePath = path.join(screenshotsDir, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Delete file
      }
    });
    console.log("Screenshots folder cleaned.");
  } else {
    console.log("Screenshots folder does not exist, no cleaning needed.");
  }
};

Before(async function () {
  // Clean the allure-results folder before the tests start
  cleanAllureResultsFolder();
  cleanScreenshotsFolder();

  if (!browser) {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    page = await context.newPage();
    // Initialize your page object here
    homePage = {}; // Placeholder for HomePage initialization
  }
});

// AfterStep hook to take screenshot if a step fails
AfterStep(async function ({ result, pickle }: any) {
  // Only take screenshots if the step fails
  if (result.status === Status.FAILED) {
    const screenshotPath = path.join(
      screenshotsDir,
      `${pickle.name}-step-failed.png`
    );

    try {
      // Ensure the directory exists
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Take screenshot and attach to Allure report
      const buffer = await page.screenshot({ fullPage: true });
      fs.writeFileSync(screenshotPath, buffer); // Save screenshot to disk

      // Attach to allure report
      this.attach(fs.readFileSync(screenshotPath), "image/png");
      console.log(`Screenshot taken for failed step: ${screenshotPath}`);
    } catch (error) {
      console.error("Error while taking/attaching screenshot for failed step:", error);
    }
  }
});

// After hook to log status and take screenshots for the scenario
After(async function ({ gherkinDocument, pickle, result }: any) {
  const status = result?.status === Status.PASSED ? "Pass" : "Fail";

  // Log feature and scenario names
  console.log("Feature:", gherkinDocument.feature?.name);
  console.log("Scenario:", pickle.name);
  console.log("Test status:", status);

  // Capture screenshot for the entire scenario if needed
  const screenshotFileName = `${pickle.name}-s${new Date().getTime()}.png`;

  try {
    // Ensure the directory for the screenshots exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Take screenshot and save it only if the test failed
    if (status === "Fail") {
      const buffer = await page.screenshot({
        path: path.join(screenshotsDir, screenshotFileName),
        fullPage: true,
      });

      // Attach the screenshot to Allure report
      this.attach(
        fs.readFileSync(path.join(screenshotsDir, screenshotFileName)),
        "image/png"
      );
      console.log(`Screenshot saved: ${screenshotFileName}`);
    }
  } catch (error) {
    console.error("Error while capturing screenshot for scenario:", error);
  }

  // Log the status and whether the page exists
  console.log("Status:", status);
  console.log("Has page:", Boolean(page));

  // Close the page and browser for cleanup
  if (page) {
    await page.close();
  }
  if (browser) {
    await browser.close();
  }
});
