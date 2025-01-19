import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect, devices } from '@playwright/test';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

// Define a global page and browser variable for test lifecycle
let browser: Browser;
let page: Page;
let context: BrowserContext;
let currentViewport: { width: number; height: number };

// Initialize the browser in the Before hook
Before(async () => {
  browser = await chromium.launch();  // or use chromium.launch({ headless: false }) to see the tests
});


// Helper function to set up the device context
const setupDevice = async (device: string) => {
  context = await browser.newContext({
    viewport: devices[device].viewport,
    userAgent: devices[device].userAgent,  // The user agent will be set automatically here
  });
  page = await context.newPage();
  currentViewport = devices[device].viewport; // Store the viewport for checking later
  await page.goto('https://marvel-dashboard-seven.vercel.app/characters'); // Replace with the actual dashboard URL
};

// Helper function to check if the device is desktop based on viewport
const isDesktop = () => {
  return currentViewport.width > 768; // Check if width is greater than a mobile breakpoint (768px)
};

Given('The users navigates to the Marvel Dashboard home page on a desktop device', async function () {
  await setupDevice('Desktop');
});

Given('The users navigates to the Marvel Dashboard home page on a mobile device', async function () {
  await setupDevice('iPhone 12'); // Adjust for other mobile devices as needed
});



Then('A lists of Marvels characters is displayed automatically with the following details:', async function (dataTable) {
  const requiredDetails = dataTable.rawTable.slice(1).flat();
  const charactersTable = page.locator('table tbody tr');
  const initialRowCount = await charactersTable.count();
  
  // Ensure rows are loaded
  expect(initialRowCount).toBeGreaterThan(0); 

  // Verify details for each character in the first page load
  const rows = await charactersTable.elementHandles();
  for (const row of rows) {
    if (requiredDetails.includes('Image')) {
      const thumbnail = await row.$('td img');
      expect(await thumbnail?.isVisible()).toBeTruthy();
      expect(await thumbnail?.getAttribute('src')).not.toBeNull();
    }

    if (requiredDetails.includes('Name')) {
      const name = await row.$('td.name');
      expect(await name?.textContent()).not.toBeNull();
    }

    if (requiredDetails.includes('Description')) {
      const shortDescription = await row.$('td.short-description');
      if (shortDescription) {
        expect(await shortDescription.textContent()).toMatch(/.+/);
      }
    }

    if (requiredDetails.includes('Status') && isDesktop()) {
      const comics = await row.$('td.number-of-comics');
      expect(comics).not.toBeNull();
    }

    if (requiredDetails.includes('Number of comics') && isDesktop()) {
      const comics = await row.$('td.number-of-comics');
      expect(comics).not.toBeNull();
    }

    if (requiredDetails.includes('Published') && isDesktop()) {
      const publishedDate = await row.$('td.published-date');
      expect(publishedDate).not.toBeNull();
    }
  }
});

Then('The characters are displayed in a table', async function () {
  const table = page.locator('table.character-table');
  await expect(table).toBeVisible();
});

Then('Additional characters load as the user scrolls down', async function () {
  const charactersTable = page.locator('table.character-table tbody tr');
  const initialRowCount = await charactersTable.count(); // Get the initial row count

  // Scroll down and wait for additional rows to load
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000); // Adjust timeout based on loading time

  const newRowCount = await charactersTable.count(); // Get the new row count
  expect(newRowCount).toBeGreaterThan(initialRowCount);
});

When('Desktop-only fields are not displayed:', async function (dataTable) {
    const desktopOnlyFields = dataTable.rawTable.slice(1).flat();
    const charactersTable = page.locator('table.character-table tbody tr');
  
    const rows = await charactersTable.elementHandles();
    for (const row of rows) {
      for (const field of desktopOnlyFields) {
        let selector: string | undefined;
        if (field === 'Number of comics') {
          selector = 'td.number-of-comics';
        } else if (field === 'Published date') {
          selector = 'td.published-date';
        }
  
        // Ensure selector is defined before calling page.$()
        if (selector) {
          const element = await row.$(selector);
          expect(element).toBeNull(); // Field should not exist
        }
      }
    }
  });