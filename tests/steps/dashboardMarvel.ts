import { Before, After, Given, Then, When } from "@cucumber/cucumber";
import {
  chromium,
  Browser,
  Page,
  BrowserContext,
  devices,
  Locator,
} from "playwright";
import { expect } from '@playwright/test';

// Define a global page and browser variable for the test lifecycle
let browser: Browser;
let page: Page;
let context: BrowserContext;
let currentViewport: { width: number; height: number };

// Initialize the browser in the Before hook
Before(async () => {
  browser = await chromium.launch({ headless: false });  // Change headless: true to see the tests in action
});

// Helper function to set up the device context
const setupDevice = async (device: string) => {
  let viewport: { width: number; height: number };
  let userAgent: string;

  if (device === 'Desktop') {
    // Define custom viewport for desktop
    viewport = { width: 1280, height: 800 }; // Adjust for desktop screen size
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  } else if (devices[device]) {
    // Use predefined mobile device settings from Playwright
    viewport = devices[device].viewport!;
    userAgent = devices[device].userAgent!;
  } else {
    throw new Error(`Unknown or unsupported device: ${device}. Available devices: ${Object.keys(devices).join(', ')}`);
  }

  // Create a new browser context with the specified viewport and userAgent
  context = await browser.newContext({
    viewport: viewport,
    userAgent: userAgent,
  });

  // Create a new page in the context
  page = await context.newPage();
  currentViewport = viewport; // Store the viewport for later checks

  // Navigate to the Marvel Dashboard page
  await page.goto('https://marvel-dashboard-seven.vercel.app/characters'); // Replace with the actual URL
};

// Helper function to check if the device is desktop based on viewport
const isDesktop = () => {
  return currentViewport.width > 768; // Check if width is greater than a mobile breakpoint (768px)
};

// After hook to clean up the browser after tests
After(async () => {
  await browser.close();
});

// Sample Given/When/Then steps using Cucumber
Given('The users navigates to the Marvel Dashboard home page on a desktop device', async function () {
  await setupDevice('Desktop');
});

Given('The users navigates to the Marvel Dashboard home page on a mobile device', async function () {
  await setupDevice('iPhone 12'); // Replace 'iPhone 12' with the desired device from the Playwright devices list
});

// Now you can use `isDesktop()` to assert conditions based on the device's viewport
Then('The dashboards should render differently based on the device type', async function () {
  if (isDesktop()) {
    // Perform actions or assertions for desktop devices
    console.log('Rendering in desktop mode');
  } else {
    // Perform actions or assertions for mobile devices
    console.log('Rendering in mobile mode');
  }
});

Then('The dashboards loads successfully', async function () {
  await expect(page).toHaveTitle("Marvel Dashboard App"); // Replace with the actual title
  await page.waitForSelector('table', { state: 'visible' });
});

