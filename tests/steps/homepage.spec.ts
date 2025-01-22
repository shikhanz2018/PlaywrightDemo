// import { Given, When, Then ,Before} from '@cucumber/cucumber';
// import { chromium, expect, Page } from '@playwright/test';
// import { HomePage } from '../pages/HomePage';

// let page: Page;
// let homePage: HomePage;

// Before(async () => {
//     // Launch browser and create a new page instance
//     const browser = await chromium.launch({ headless: false });
//     const context = await browser.newContext();
//     page = await context.newPage();

//     // Initialize HomePage with the page instance
//     homePage = new HomePage(page);
// });

// Given('I am on {string}', async (url: string) => {
//     await homePage.navigateToHomePage(url);
// });

// When('I click on the Insurance menu', async () => {
//     await homePage.clickMenuButton();  // Assuming there's a method to click the menu button
//     await homePage.navigateToInsurance();  // Assuming this method navigates to the Insurance section
// });

// Then('I should see the Suncorp logo', async () => {
//     await expect(homePage.logo).toBeVisible();
// });

// Then('The homepage logo should be visible', async () => {
//     // Additional check to ensure the homepage logo is visible
//     await expect(homePage.logo).toBeVisible();
// });

