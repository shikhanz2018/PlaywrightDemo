// import { Given, When, Then, setDefaultTimeout, After } from '@cucumber/cucumber';
// import { chromium, Browser, Page } from 'playwright';
// import * as assert from 'assert';

// let browser: Browser;
// let page: Page;

// // Set default timeout for all steps
// setDefaultTimeout(60000); // Increased timeout to handle delays in loading

// Given('the user navigates to the Marvel Dashboard', async () => {
//   const url = 'https://www.marvel.com/characters';

//   // Launch browser with debug settings
//   browser = await chromium.launch({
//     headless: false,
//     slowMo: 50,
//   });

//   const context = await browser.newContext();
//   page = await context.newPage();

//   try {
//     console.log('Navigating to Marvel Dashboard...');
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Improved waitUntil and timeout
//   } catch (error) {
//     console.error('Error navigating to the Marvel Dashboard:', error);
//     throw error;
//   }
// });

// Then('the character list should be visible', async () => {
//   const characters = await page.locator('img[mvl-type="explore"]');
//   const count = await characters.count();
//   for (let i = 0; i < count; i++) {
//     const isVisible = await characters.nth(i).isVisible();
//     assert.strictEqual(isVisible, true, `Character at index ${i} should be visible`);
//   }
// });


// Then('there should be 10 characters displayed initially', async () => {
//   const characterItems = await page.locator('img[mvl-type="explore"]'); // CSS selector for character items

//   try {
//     const characterCount = await characterItems.count();
//     assert.strictEqual(characterCount, 10, 'There should be 10 characters initially');
//     console.log('Verified that 10 characters are displayed initially.');
//   } catch (error) {
//     console.error('Failed to verify the number of characters:', error);
//     throw error;
//   }
// });

// Given('the user is on the Marvel Dashboard', async () => {
//   const url = 'https://www.marvel.com/characters';

//   try {
//     console.log('Navigating to Marvel Dashboard...');
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
//   } catch (error) {
//     console.error('Error navigating to the Marvel Dashboard:', error);
//     throw error;
//   }
// });

// When('the user scrolls down', async () => {
//   try {
//     const initialCount = await page.locator('img[mvl-type="explore"]').count();
//     console.log(`Initial character count: ${initialCount}`);

//     await page.mouse.wheel(0, 1000); // Scroll down
//     await page.waitForTimeout(3000); // Wait for new content to load

//     const newCount = await page.locator('img[mvl-type="explore"]').count();
//     console.log(`New character count after scrolling: ${newCount}`);

//     assert.strictEqual(newCount > initialCount, true, 'The number of characters should increase after scrolling');
//   } catch (error) {
//     console.error('Error during scrolling or verifying characters:', error);
//     throw error;
//   }
// });

// When('the user searches for {string}', async (searchTerm: string) => {
//   try {
//     console.log(`Searching for characters with term: ${searchTerm}`);
//     await page.fill('#search-bar', searchTerm); // CSS selector for the search bar
//     await page.press('#search-bar', 'Enter');
//     await page.waitForSelector('img[mvl-type="explore"]', { timeout: 15000 }); // Wait for search results to load
//   } catch (error) {
//     console.error('Error during search:', error);
//     throw error;
//   }
// });

// Then('only characters matching {string} should be displayed', async (searchTerm: string) => {
//   const characterList = await page.locator('img[mvl-type="explore"]');

//   try {
//     const characterCount = await characterList.count();
//     console.log(`Number of characters matching "${searchTerm}": ${characterCount}`);
//     assert.strictEqual(characterCount > 0, true, `Characters matching "${searchTerm}" should be displayed`);
//   } catch (error) {
//     console.error('Failed to verify characters matching the search term:', error);
//     throw error;
//   }
// });

// Then('the message {string} should be displayed', async (message: string) => {
//   try {
//     const noResultsMessage = await page.locator('.no-results'); // CSS selector for no results message
//     const messageText = await noResultsMessage.textContent();
//     console.log(`No results message: ${messageText}`);
//     assert.strictEqual(messageText, message, `"${message}" message should be displayed`);
//   } catch (error) {
//     console.error('Failed to verify the no-results message:', error);
//     throw error;
//   }
// });


