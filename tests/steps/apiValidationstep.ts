// import { Given, When, Then ,After} from '@cucumber/cucumber';
// import { chromium, Browser, Page, BrowserContext, devices } from 'playwright';
// import { expect, APIRequestContext } from '@playwright/test';
// import fetch from 'node-fetch'; // To fetch API

// const marvelApiBaseUrl = 'https://gateway.marvel.com/v1/public/characters';
// const apiKey = 'your-public-api-key';  // Replace with your public key

// let page: Page;
// let browserContext: BrowserContext;
// let browser: Browser;

// Given('The user navigates to the Marvel Dashboard home page on a desktop device', async () => {
//     browser = await chromium.launch({ headless: false });
//     browserContext = await browser.newContext();
//     page = await browserContext.newPage();
    
//     await page.goto('https://www.marvel.com/characters');
//     await page.setViewportSize({ width: 1920, height: 1080 });
// });

// Then('The dashboard should render differently based on the device type', async () => {
//     const isDesktop = await page.isVisible('.desktop-layout-class');
//     expect(isDesktop).toBe(true);
// });

// Then('The dashboard loads successfully', async () => {
//     const dashboard = await page.isVisible('.dashboard');
//     expect(dashboard).toBe(true);
// });

// Then('A list of Marvel characters is displayed automatically with the following details:', async (dataTable) => {
//     const characters = await page.$$('.character-row');
    
//     for (let i = 0; i < characters.length; i++) {
//         const row = characters[i];
        
//         const img = await row.locator('td img');
//         const name = await row.locator('td:nth-child(2)');
//         const description = await row.locator('td:nth-child(3)');
//         const status = await row.locator('td:nth-child(4)');
//         const comics = await row.locator('td:nth-child(5)');
//         const published = await row.locator('td:nth-child(6)');
        
//         expect(await img.isVisible()).toBe(true);  // Image should be visible
//         expect(await name.textContent()).not.toBe('');
//         expect(await description.textContent()).not.toBe('');

//         // For desktop only, validate comics and published
//         if (await page.isVisible('.desktop-layout-class')) {
//             expect(await comics.textContent()).not.toBe('');
//             expect(await published.textContent()).not.toBe('');
//         }
//     }
// });

// Given('The characters are displayed on the dashboard home page', async () => {
//     const characters = await page.$$('.character-row');
//     expect(characters.length).toBeGreaterThan(0);
// });

// When('The user scrolls down the list', async () => {
//     await page.evaluate(() => {
//         window.scrollBy(0, window.innerHeight);
//     });
//     await page.waitForTimeout(2000); 
// });

// Then('Additional characters are loaded dynamically (pagination or infinite scrolling)', async () => {
//     const charactersBeforeScroll = await page.$$('.character-row');
//     await page.evaluate(() => {
//         window.scrollBy(0, window.innerHeight);
//     });
//     await page.waitForTimeout(2000); 
//     const charactersAfterScroll = await page.$$('.character-row');
//     expect(charactersAfterScroll.length).toBeGreaterThan(charactersBeforeScroll.length); 
// });

// Given('The user has fetched Marvel character details via API', async () => {
//     const response = await fetch(`${marvelApiBaseUrl}?apikey=${apiKey}`);
//     const data = await response.json();
//     expect(response.ok).toBe(true);
//     global.apiCharacters = data.data.results;
// });

// When('The user views the Marvel characters list on the UI', async () => {
//     await page.goto('https://www.marvel.com/characters');
// });

// Then('The character details on the UI should match the API response', async () => {
//     const uiCharacters = await page.$$('.character-row');
    
//     for (let i = 0; i < uiCharacters.length; i++) {
//         const name = await uiCharacters[i].locator('td:nth-child(2)').textContent();
//         const apiCharacter = global.apiCharacters.find((apiChar: any) => apiChar.name === name);
        
//         expect(apiCharacter).toBeDefined();
//         expect(await uiCharacters[i].locator('td:nth-child(3)').textContent()).toBe(apiCharacter.description);
//     }
// });

// // Clean up after each test
// After(async () => {
//     await browser.close();
// });