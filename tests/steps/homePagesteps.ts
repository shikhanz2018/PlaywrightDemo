import { Given, Then , setDefaultTimeout  } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';  // Import Browser and Page types
import * as assert from 'assert';  // Using Node.js assert

// Explicitly define types for browser and page
let browser: Browser;
let page: Page;
setDefaultTimeout(6000);

Given('I navigate to {string}', async (url: string) => {
  browser = await chromium.launch({
    headless: false,
    slowMo: 50,  // Slow down the actions by 50ms for better visibility
    devtools: false,  // Open DevTools automatically
  });
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(url, { timeout: 6000 });
});

Then('I should see the title {string}', async (expectedTitle: string) => {
  const link = await page.locator(`//a[@title='${expectedTitle}']`).nth(0);
  // Retrieve the 'title' attribute of the link
  const linkTitle = await link.getAttribute('title');
  
  // Perform assertion to check if the 'title' attribute matches the expected value
  assert.strictEqual(linkTitle, expectedTitle); 
  await page.waitForTimeout(3000); 

  link.click();  // Use assert to check equality
  const subEventlink = await page.locator("//li[contains(@class, 'link listLeft')]//a[@title='GDT Events']").nth(0);
  await subEventlink.waitFor({ state: 'visible' });  // Wait for the link to be visible

  // Assert that the link is visible
  const isVisible = await subEventlink.isVisible();
  assert.strictEqual(isVisible, true, 'The link should be visible');
  await page.waitForTimeout(4000); 

  //await browser.close();
});

// Then('I should see the title with subtitle {string,string}', async (expectedTitle: string, subtitle: string) => {
//   // Modify the locator to include the dynamic 'expectedTitle' and 'subtitle'
//   const link = await page.locator(`//a[@title='${expectedTitle}']`).nth(0);
//   // Retrieve the 'title' attribute of the link
//   const linkTitle = await link.getAttribute('title');
  
//   /// Correct assertion for exact matching
// assert.strictEqual(linkTitle, expectedTitle, 'Title should exactly match the expectedTitle');
 
//   await page.waitForTimeout(3000); 

//   link.click();  // Click the link
//   const subEventlink = await page.locator(`//li[contains(@class, 'link')]//a[contains(@title, '${subtitle}')]`);

//   await subEventlink.waitFor({ state: 'visible' });  // Wait for the link to be visible

//   // Assert that the link is visible
//   const isVisible = await subEventlink.isVisible();
//   assert.strictEqual(isVisible, true, 'The link should be visible');
  
//   await page.waitForTimeout(4000); 
  
//   await browser.close();
// });

Then('I should see the title with subtitle {string} {string}', async (expectedTitle: string, subtitle: string) =>{ 
 
  const link = await page.locator(`//a[@title='${expectedTitle}']`);
  // Retrieve the 'title' attribute of the link
  const linkTitle = await link.getAttribute('title');
  
  /// Correct assertion for exact matching
assert.strictEqual(linkTitle, expectedTitle, 'Title should exactly match the expectedTitle');
 
  await page.waitForTimeout(3000); 


  link.click();  // Click the link
  const subEventlink = await page.locator(`//a[@title='${subtitle}']`);

  await subEventlink.waitFor({ state: 'visible' });  // Wait for the link to be visible

  // Assert that the link is visible
  const isVisible = await subEventlink.isVisible();
  assert.strictEqual(isVisible, true, 'The link should be visible');
  
  await page.waitForTimeout(4000); 
  
  await browser.close();
});