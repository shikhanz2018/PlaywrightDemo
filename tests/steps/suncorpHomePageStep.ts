// spec.ts
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import {  expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

import { page } from '../../support/hooks';
let homePage: HomePage;
// Set default timeout for all steps
setDefaultTimeout(60000); // Increased timeout to handle delays in loading

const baseurl = 'https://www.suncorp.co.nz/';

Given('the user navigates to the Dashboard', async () => {
  homePage = new HomePage(page);
  try {
    console.log('Navigating to Dashboard...');
    await homePage.navigateToHomePage(baseurl);
  } catch (error) {
    console.error('Error navigating to the Dashboard:', error);
    throw error;
  }
});

Given('the user is on the Dashboard', async () => {
  try {
    console.log('Navigating to Dashboard...');
    await homePage.navigateToHomePage(baseurl);
  } catch (error) {
    console.error('Error navigating to the Dashboard:', error);
    throw error;
  }
});

// When('the user searches for {string}', async (searchTerm: string) => {
//   try {
//     console.log(`Searching for characters with term: ${searchTerm}`);
//     await homePage.searchForCharacter(searchTerm);
//   } catch (error) {
//     console.error('Error during search:', error);
//     throw error;
//   }
// });

// Then('the message {string} should be displayed', async (message: string) => {
//   try {
//     const noResultsMessage = await homePage.getNoResultsMessage();
//     console.log(`No results message: ${noResultsMessage}`);
//     expect(noResultsMessage).toBe(message);
//   } catch (error) {
//     console.error('Failed to verify the no-results message:', error);
//     throw error;
//   }
// });

Then('The homepage logo should be visible', async () => {
  // Additional check to ensure the homepage logo is visible
  await expect(homePage.logo).toBeVisible();
});
