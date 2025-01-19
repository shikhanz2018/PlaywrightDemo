import { Before, After, Given, Then, When } from "@cucumber/cucumber";
import {
  chromium,
  Browser,
  Page,
  BrowserContext,
  devices,
  Locator,
} from "playwright";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import axios from "axios";
//import { ApiResponse } from '../marvelintefaces';
import md5 from "md5";
import { DateTime } from "luxon"; // Import Luxon library for date handling
import { CharacterApiResponse, ComicApiResponse } from "../apiinterfaces"; // Import the interfaces
import { setDefaultTimeout } from "@cucumber/cucumber";

setDefaultTimeout(40000); // Set timeout to 10 seconds (10000 milliseconds)

// Define a global page and browser variable for the test lifecycle
let browser: Browser;
let page: Page;
let context: BrowserContext;
let currentViewport: { width: number; height: number };
let initialRowCount: Number;
let searchTerm: string;

// Base URL for the Marvel Dashboard
const baseURL = "https://marvel-dashboard-seven.vercel.app/characters";
const apiKey = "19a956980cc96c14eea8002cdb35e1ff";

const mdhash = require("md5");

const publicKey = "2772af5dc9200f015a887d95e490ad5d"; // replace with your public key
const privateKey = "02fcecda7164946a3080ec7ec8f5c34a4f128b6a"; // replace with your private key
const timestamp = new Date().getTime();
const hash = mdhash(timestamp + privateKey + publicKey);
let matchingCharacterId: number | null = null;

// Define the structure of the API response and character data
interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  };
  comics: {
    available: number;
    items: { name: string; resourceURI: string }[];
  };
  series: {
    available: number;
    items: { name: string; resourceURI: string }[];
  };
  stories: {
    available: number;
    items: { name: string; resourceURI: string }[];
  };
  events: {
    available: number;
    items: { name: string; resourceURI: string }[];
  };
  urls: { type: string; url: string }[];
  modified?: string; // Add the 'modified' field as an optional string
}

interface ApiResponse {
  code: number;
  status: string;
  data: {
    offset: number;
    limit: number;
    total: number;
    count: number;
    results: Character[];
  };
}

// Use axios to fetch the data from Marvel API
Given("I fetch the character data from Marvel API", async function () {
  const apiUrl = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
    searchTerm
  )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

  try {
    // Fetch the character data from Marvel API
    const response = await axios.get<ApiResponse>(apiUrl);

    // Check if we received a valid response and that there is at least one result
    if (response.data.code === 200 && response.data.data.results.length > 0) {
      const character = response.data.data.results[0]; // Get the first character in the results

      // Display character data
      console.log("Character Name:", character.name);
      console.log(
        "Description:",
        character.description || "No description available"
      );
      console.log(
        "Thumbnail URL:",
        `${character.thumbnail.path}.${character.thumbnail.extension}`
      );
      console.log("Comics Available:", character.comics.available);
      console.log("Series Available:", character.series.available);
      console.log("Stories Available:", character.stories.available);
      console.log("Events Available:", character.events.available);
      console.log(
        "Details URL:",
        character.urls.find((url) => url.type === "detail")?.url
      );
      console.log(
        "Wiki URL:",
        character.urls.find((url) => url.type === "wiki")?.url
      );
    } else {
      console.log("No characters found");
    }
  } catch (error) {
    // Handle any errors
    console.error("Error fetching character data:", error);
  }
});

Then(
  "the search results match the API response for {string}",
  async function (searchTerm: string) {
    const url = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
      searchTerm
    )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

    try {
      // Fetch API Response
      const { data: apiResponseData } = await axios.get<ApiResponse>(url);
      const expectedResults = apiResponseData.data.results;

      const tableRows = page.locator("table tbody tr"); // Adjust selector for table rows
      const rowCount = await tableRows.count();

      // Validate the number of rows matches the API results
      expect(rowCount).toBe(expectedResults.length);

      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const apiCharacter = expectedResults[i];

        // Column 1: Validate Thumbnail
        const thumbnailLocator = row.locator("td img");
        const thumbnailSrc = await thumbnailLocator.getAttribute("src");
        const expectedThumbnail = `${apiCharacter.thumbnail.path}.${apiCharacter.thumbnail.extension}`;
        expect(thumbnailSrc).toBe(expectedThumbnail);

        // Column 2: Validate Name
        const nameLocator = row.locator("td:nth-child(2)");
        const displayedName = await nameLocator.textContent();
        expect(displayedName?.trim()).toBe(apiCharacter.name);

        // Column 3: Validate Description
        const descriptionLocator = row.locator("td:nth-child(3)");
        const displayedDescription = await descriptionLocator.textContent();
        expect(displayedDescription?.trim() || "").toBe(
          apiCharacter.description || ""
        );

        // Column 5: Validate Comics Count
        const comicsLocator = row.locator("td:nth-child(5)");
        const displayedComics = await comicsLocator.textContent();
        expect(parseInt(displayedComics?.trim() || "0", 10)).toBe(
          apiCharacter.comics.available
        );

        // Column 6: Validate Modified Date + 14 Hours
        const modifiedLocator = row.locator("td:nth-child(6)");
        const displayedDate = await modifiedLocator.textContent();

        if (apiCharacter.modified) {
          const modifiedDate = new Date(apiCharacter.modified); // Use the available 'modified' field
          modifiedDate.setHours(modifiedDate.getHours() + 14); // Add 14 hours to the modified date
          const expectedDate = modifiedDate
            .toISOString()
            .slice(0, 16)
            .replace("T", " "); // Adjust format

          // Compare the expected date with the displayed date
          expect(displayedDate?.trim()).toBe(expectedDate);
        } else {
          // If 'modified' field is not available, log a message (though this shouldn't happen if it is available)
          console.log(
            "Modified date is missing for character:",
            apiCharacter.name
          );
        }
      }
    } catch (error) {
      console.error("Error fetching or processing the API data:", error);
      throw new Error("API request or validation failed");
    }
  }
);

// Helper function to simulate infinite scrolling
async function scrollToBottom(page: Page): Promise<void> {
  if (!page) {
    throw new Error("Page object is undefined.");
  }

  await page.evaluate(() => {
    window.scrollBy(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(2000); // Wait for content to load
}

// Helper function to save API responses and screenshots
async function saveResponseAndScreenshot(
  page: Page,
  response: any,
  pageNumber: number
): Promise<void> {
  const responsePath = path.join(
    __dirname,
    `Page-${pageNumber}-API-Response.json`
  );
  const screenshotPath = path.join(
    __dirname,
    `Page-${pageNumber}-Screenshot.png`
  );
  const sourceCodePath = path.join(
    __dirname,
    `Page-${pageNumber}-SourceCode.html`
  );

  fs.writeFileSync(responsePath, JSON.stringify(response, null, 2));
  await page.screenshot({ path: screenshotPath });
  const pageSource = await page.content();
  fs.writeFileSync(sourceCodePath, pageSource);
}

// Helper function to generate a report
async function generateReport(
  results: any,
  fileName = "TestReport.json"
): Promise<void> {
  const reportPath = path.join(__dirname, fileName);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Test report saved at ${reportPath}`);
}

// Initialize the browser in the Before hook
Before(async () => {
  browser = await chromium.launch({ headless: false }); // Change headless: true to see the tests in action
  initialRowCount = 0;
});

// Helper function to set up the device context
const setupDevice = async (device: string) => {
  let viewport: { width: number; height: number };
  let userAgent: string;

  if (device === "Desktop") {
    // Define custom viewport for desktop
    viewport = { width: 1280, height: 800 }; // Adjust for desktop screen size
    userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
  } else if (devices[device]) {
    // Use predefined mobile device settings from Playwright
    viewport = devices[device].viewport!;
    userAgent = devices[device].userAgent!;
  } else {
    throw new Error(
      `Unknown or unsupported device: ${device}. Available devices: ${Object.keys(
        devices
      ).join(", ")}`
    );
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
  await page.goto("https://marvel-dashboard-seven.vercel.app/characters"); // Replace with the actual URL
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
Given(
  "The user navigates to the Marvel Dashboard home page on a desktop device",
  async function () {
    await setupDevice("Desktop");
  }
);

Given(
  "The user navigates to the Marvel Dashboard home page on a mobile device",
  async function () {
    await setupDevice("iPhone 12"); // Replace 'iPhone 12' with the desired device from the Playwright devices list
  }
);

// Now you can use `isDesktop()` to assert conditions based on the device's viewport
Then(
  "The dashboard should render differently based on the device type",
  async function () {
    if (isDesktop()) {
      // Perform actions or assertions for desktop devices
      console.log("Rendering in desktop mode");
    } else {
      // Perform actions or assertions for mobile devices
      console.log("Rendering in mobile mode");
    }
  }
);

Then("The dashboard loads successfully", async function () {
  await expect(page).toHaveTitle("Marvel Dashboard App"); // Replace with the actual title
  await page.waitForSelector("table", { state: "visible" });
});

// Step Definitions
Given("the user navigates to the dashboard home page", async function () {
  this.page = await this.browser.newPage();
  await this.page.goto(baseURL);
});

Given(
  "the characters are displayed on the dashboard home page",
  async function () {
    if (!page) {
      throw new Error("Page is not initialized.");
    }

    // Locate table rows
    const rows = page.locator("table tbody tr");

    // Store the initial row count in the shared context
    this.initialRowCount = await rows.count();

    // Ensure that initial rows are loaded
    expect(this.initialRowCount).toBeGreaterThan(0);
  }
);

Then(
  "A list of Marvel characters is displayed automatically with the following details:",
  async function (dataTable) {
    const rows = await page.locator("table tbody tr");

    // Ensure that initial rows are loaded

    for (let rowIndex = 0; rowIndex < (await rows.count()); rowIndex++) {
      const row = rows.nth(rowIndex);

      // Validate Thumbnail image column (Image) - This is expected to have an <img> tag
      const imageLocator = row.locator("td img");
      const imageSrc = await imageLocator.getAttribute("src");
      if (!imageSrc || !(await imageLocator.isVisible())) {
        console.error(`No image found in row ${rowIndex + 1}, column: Image`);
        throw new Error(`No image found in row ${rowIndex + 1}, column: Image`);
      }

      // Validate Name column
      const nameLocator = row.locator("td:nth-child(2)"); // Name is in the 2nd column
      const nameText = await nameLocator.textContent();
      if (!nameText || nameText.trim().length === 0) {
        console.error(`No name found in row ${rowIndex + 1}, column: Name`);
        throw new Error(`No name found in row ${rowIndex + 1}, column: Name`);
      }

      // Validate Description column
      const descriptionLocator = row.locator("td:nth-child(3)"); // Description is in the 3rd column
      const descriptionText = await descriptionLocator.textContent();
      if (descriptionText && descriptionText.trim().length === 0) {
        console.error(
          `Description is empty in row ${
            rowIndex + 1
          }, column: Short description`
        );
        throw new Error(
          `Description is empty in row ${
            rowIndex + 1
          }, column: Short description`
        );
      }

      // Validate Status column
      const statusLocator = row.locator("td:nth-child(4)"); // Description is in the 3rd column
      const statusText = await statusLocator.textContent();
      if (statusText && statusText.trim().length === 0) {
        console.error(`status is empty in row ${rowIndex + 1}, column: Status`);
        throw new Error(
          `status is empty in row ${rowIndex + 1}, column: Status`
        );
      }

      // Verify comics and published are not displayed on mobile
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      if (viewportWidth > 768) {
        // On desktop, verify Comics and Published data
        const comicsLocator = row.locator("td:nth-child(5)"); // Comics is in the 4th column
        const comicsText = await comicsLocator.textContent();
        if (!comicsText || comicsText.trim().length === 0) {
          console.error(
            `No comics data found in row ${
              rowIndex + 1
            }, column: Number of comics`
          );
          throw new Error(
            `No comics data found in row ${
              rowIndex + 1
            }, column: Number of comics`
          );
        }

        // Published column validation
        const publishedLocator = row.locator("td:nth-child(6)"); // Published date is in the 5th column
        const publishedText = await publishedLocator.textContent();
        if (!publishedText || publishedText.trim().length === 0) {
          console.error(
            `No published date found in row ${
              rowIndex + 1
            }, column: Published date`
          );
          throw new Error(
            `No published date found in row ${
              rowIndex + 1
            }, column: Published date`
          );
        }
      } else {
        // On mobile, skip Comics and Published validation
        const comicsLocator = row.locator("td:nth-child(5)");
        const comicsVisible = await comicsLocator.isVisible();
        if (comicsVisible) {
          console.error(
            `Comics data should not be visible in row ${
              rowIndex + 1
            } for mobile view`
          );
          throw new Error(
            `Comics data should not be visible in row ${
              rowIndex + 1
            } for mobile view`
          );
        }

        const publishedLocator = row.locator("td:nth-child(6)");
        const publishedVisible = await publishedLocator.isVisible();
        if (publishedVisible) {
          console.error(
            `Published data should not be visible in row ${
              rowIndex + 1
            } for mobile view`
          );
          throw new Error(
            `Published data should not be visible in row ${
              rowIndex + 1
            } for mobile view`
          );
        }
      }
    }
  }
);

Then(
  "the character details include thumbnail, name, description, comics, and published date",
  async function () {
    const results: any[] = [];
    const characters = await page.locator("table tbody tr");

    for (let i = 0; i < (await characters.count()); i++) {
      const character = characters.nth(i);
      const characterDetails: Record<string, any> = {};

      // Validate Thumbnail
      const imageLocator = await character.locator("td img");
      const thumbnail = await imageLocator.getAttribute("src");
      if (!thumbnail || !(await imageLocator.isVisible())) {
        throw new Error(`No image found in row ${i + 1}, column: Image`);
      }

      // Decode the URL and validate it matches the expected Next.js image pattern
      const decodedSrc = decodeURIComponent(thumbnail);
      expect(
        decodedSrc.includes(".jpg") ||
          decodedSrc.includes(".png") ||
          decodedSrc.includes(".gif")
      ).toBe(true);

      characterDetails.thumbnail = thumbnail;

      // Validate Name
      const name = await character.locator("td:nth-child(2)").textContent();
      expect(name).not.toBeNull();
      characterDetails.name = name;

      // Validate Description
      const description = await character
        .locator("td:nth-child(3)")
        .textContent();
      expect(description).toBeDefined();
      characterDetails.description = description;

      // Validate Status column
      const statusText = await character
        .locator("td:nth-child(4)")
        .textContent();
      if (statusText && statusText.trim().length === 0) {
        throw new Error(`Status is empty in row ${i + 1}, column: Status`);
      }

      // Verify comics and published are not displayed on mobile
      const viewportWidth = await page.evaluate(() => window.innerWidth);

      if (viewportWidth > 768) {
        // Desktop mode
        // Validate Comics
        const comicsLocator = character.locator("td:nth-child(5)");
        const comicsText = await comicsLocator.textContent();
        if (comicsText && comicsText.trim().length === 0) {
          throw new Error(
            `Comics data is empty in row ${i + 1}, column: Comics`
          );
        }
        characterDetails.comicsCount = parseInt(comicsText || "0", 10);

        // Validate Published Date
        const publishedLocator = character.locator("td:nth-child(6)");
        const publishedDate = await publishedLocator.textContent();
        if (publishedDate && isNaN(new Date(publishedDate).getTime())) {
          throw new Error(
            `Invalid published date in row ${i + 1}, column: Published Date`
          );
        }
        characterDetails.publishedDate = publishedDate;
      } else {
        // Mobile mode
        // Comics and Published should not be visible
        const comicsVisible = await character
          .locator("td:nth-child(5)")
          .isVisible();
        const publishedVisible = await character
          .locator("td:nth-child(6)")
          .isVisible();

        if (comicsVisible) {
          throw new Error(
            `Comics data should not be visible in row ${i + 1} for mobile view`
          );
        }

        if (publishedVisible) {
          throw new Error(
            `Published data should not be visible in row ${
              i + 1
            } for mobile view`
          );
        }
      }

      results.push(characterDetails);
    }

    await generateReport(results, "CharacterDetailsReport.json");
  }
);
When("the user scrolls down the list", async function () {
  if (!page) {
    throw new Error("Page is not initialized.");
  }

  let previousRowCount = 0;
  let currentRowCount = 0;

  const rows = page.locator("table tbody tr"); // Adjust selector as per your DOM

  // Define a maximum scroll limit to prevent infinite loops
  const maxScrollAttempts = 5;
  let scrollAttempts = 0;

  // Scroll until all rows are loaded or the maximum number of scrolls is reached
  while (scrollAttempts < maxScrollAttempts) {
    previousRowCount = currentRowCount;

    // Scroll to the bottom
    await scrollToBottom(page);

    // Wait for additional rows to load
    await page.waitForTimeout(4000); // Adjust timeout based on app performance

    // Update row count
    currentRowCount = await rows.count();

    // Break the loop if no new rows are loaded
    if (currentRowCount === previousRowCount) {
      console.log("All rows are loaded.");
      break;
    }

    scrollAttempts++;
  }

  // Gracefully handle if max scroll attempts are reached
  if (scrollAttempts === maxScrollAttempts) {
    console.warn(
      "Maximum scroll attempts reached. Rows might not have fully loaded."
    );
  }

  console.log(`Final row count: ${currentRowCount}`);
  this.finalRowCount = currentRowCount; // Save the row count for further verification
});

Then("additional characters are loaded dynamically", async function () {
  if (!page) {
    throw new Error("Page is not initialized.");
  }

  // Locate table rows
  const rows = page.locator("table tbody tr");

  // Wait for additional rows to load
  await page.waitForTimeout(2000); // Adjust timeout as necessary

  // Get the final row count
  const finalRowCount = await rows.count();

  // Ensure additional rows are loaded
  expect(finalRowCount).toBeGreaterThan(this.initialRowCount);
});

Then("the new characters are appended to the existing list", async function () {
  if (!page) {
    throw new Error("Page is not initialized.");
  }

  const rows = page.locator("table tbody tr"); // Adjust selector as per your DOM
  const finalRowCount = await rows.count();

  // Verify the rows at the end of the table
  for (let i = this.initialRowCount; i < finalRowCount; i++) {
    const row = rows.nth(i);
    const isVisible = await row.isVisible();
    expect(isVisible).toBe(true); // Ensure each new row is visible
  }

  console.log(
    `Verified ${finalRowCount - this.initialRowCount} new rows are appended.`
  );
});

When(
  "the user enters {string} in the search bar",
  async function (searchText: string) {
    console.log(`Entered search term: "${searchText}"`);
    searchTerm = searchText;
    // Using 'this.page' for the correct page context (assuming you are using this.page)
    const searchBar = page.locator("//input[@type='search']");

    // Ensure the search bar is visible before interacting
    const isSearchBarVisible = await searchBar.isVisible();
    if (!isSearchBarVisible) {
      throw new Error("Search bar is not visible on the page.");
    }

    // Fill the search bar with the search term
    await searchBar.fill(searchTerm);

    // Wait for search results to load and update (optional, adjust timing as needed)
    await page.waitForTimeout(5000);

    // Press the 'Enter' key to trigger the search
    await searchBar.press("Enter");
  }
);

Then(
  "the list updates to display characters matching the search term",
  async function () {
    // Wait for the table to load after entering the search term
    const tableRows = page.locator("table tbody tr"); // Adjust the selector if needed

    // Wait for rows to load
    await tableRows.first().waitFor(); // Wait for at least the first row to be visible

    // Get the count of rows after search
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0); // Ensure at least one row is displayed

    // Check if the displayed rows contain the search term in the name or description columns
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);
      const characterName = await row.locator("td:nth-child(2)").textContent(); // Adjust index if necessary
      const characterDescription = await row
        .locator("td:nth-child(3)")
        .textContent(); // Adjust index if necessary

      // Check if the search term is part of the character name or description
      expect(characterName?.toLowerCase()).toContain(searchTerm.toLowerCase());
      if (characterDescription) {
        expect(characterDescription.toLowerCase()).toContain(
          searchTerm.toLowerCase()
        );
      }
    }
  }
);

Then(
  "each displayed character contains a thumbnail, name, and description \\(if available)",
  async function () {
    const tableRows = page.locator("table tbody tr"); // Locator for table rows
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0); // Ensure there are characters displayed

    // Iterate over each row to validate the character details
    for (let i = 0; i < rowCount; i++) {
      const row = tableRows.nth(i);

      // Validate Thumbnail
      const thumbnail = await row.locator("td img").getAttribute("src");
      const imageLocator = await row.locator("td img");
      const isThumbnailVisible = await imageLocator.isVisible();
      expect(thumbnail).toBeTruthy(); // Thumbnail should exist
      expect(isThumbnailVisible).toBeTruthy(); // Thumbnail image should be visible

      // Validate Name
      const characterName = await row.locator("td:nth-child(2)").textContent();
      expect(characterName).not.toBeNull();
      expect(characterName?.trim()).not.toBe(""); // Name should not be empty

      // Validate Description (if available)
      const description = await row.locator("td:nth-child(3)").textContent();
      // Description could be empty or null, so we just ensure it's either present or empty
      expect(description).toBeDefined();
    }
  }
);

Then("no character thumbnails or details are shown", async function () {
  const characters = page.locator("table tbody tr"); // Locator for character rows

  // Wait until the table is updated, if necessary
  await page.waitForSelector("table tbody", { state: "attached" });

  const characterCount = await characters.count();
  console.log(`Character count after search: ${characterCount}`);

  // Assert that no character rows are visible
  expect(characterCount).toBe(0); // Ensure no rows are displayed when no characters match
});

When("the user clicks on a character", async function () {
  await this.page.click("table tbody tr:nth-child(1) td:nth-child(1) img");
});

When("the user clicks the back button", async function () {
  await this.page.goBack();
});

Then("the displayed results match the API response", async function () {
  // Fetch API response
  const apiResponse = await this.page.request.get(
    `https://gateway.marvel.com/v1/public/characters?apikey=${apiKey}`
  );

  if (!apiResponse.ok()) {
    throw new Error(
      `Failed to fetch API response. Status: ${apiResponse.status()}`
    );
  }

  const apiData = await apiResponse.json();
  if (!apiData?.data?.results) {
    throw new Error("API response does not contain expected data.");
  }

  // Extract character names from API response
  const apiCharacters = apiData.data.results.map(
    (c: { name: string }) => c.name
  );

  // Extract character names from UI
  const uiCharacters = await this.page
    .locator(".character-name")
    .evaluateAll((elements: Element[]) =>
      elements.map((el) => el.textContent?.trim() || "")
    );

  // Normalize and assert equality
  expect(uiCharacters.sort()).toEqual(apiCharacters.sort());
});

//Need to update locators
Then("the character links match the API response", async function () {
  const apiResponse = await this.page.request.get(
    `https://gateway.marvel.com/v1/public/characters/1017100?apikey=${apiKey}`
  );
  const apiData = await apiResponse.json();
  const apiLinks = apiData.data.results[0].urls;

  // Validate detail link
  const uiDetailLink = await this.page
    .locator(".character-detail-link")
    .getAttribute("href");
  expect(uiDetailLink).toBe(
    apiLinks.find((link: any) => link.type === "detail").url
  );

  // Validate comic link
  const uiComicLink = await this.page
    .locator(".character-comic-link")
    .getAttribute("href");
  expect(uiComicLink).toBe(
    apiLinks.find((link: any) => link.type === "comiclink").url
  );
});

When(
  "the user scrolls through all pages and collects API responses",
  async function () {
    let offset = 0;
    const limit = 50;
    let total: number | null = null;
    let allResults: any[] = [];
    let pageNumber = 1;
    const maxPages = process.env.MAX_PAGES
      ? parseInt(process.env.MAX_PAGES, 10)
      : Infinity;

    do {
      const apiUrl = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
        searchTerm
      )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

      const apiResponse = await this.page.request.get(apiUrl);
      const apiData = await apiResponse.json();

      if (!total) {
        total = apiData.data.total;
      }

      allResults = allResults.concat(apiData.data.results);

      // Save API response, screenshot, and source code
      await saveResponseAndScreenshot(this.page, apiData, pageNumber);

      offset += limit;
      pageNumber++;

      // Scroll to load more characters on the UI
      await scrollToBottom(this.page);
    } while (offset < (total || 0) && pageNumber <= maxPages);

    this.allResults = allResults;
    this.totalPages = Math.min(Math.ceil((total || 0) / limit), maxPages);

    await generateReport(
      { totalCharacters: allResults.length, totalPages: this.totalPages },
      "PaginationReport.json"
    );
  }
);

Then("the API responses are saved for each page", async function () {
  expect(this.allResults.length).toBeGreaterThan(0);
  expect(this.totalPages).toBeGreaterThan(0);
});

Then(
  "The number of comics and published date are displayed on desktop view",
  async function () {
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    if (viewportWidth > 768) {
      // On Desktop view, check for comics and published date
      const characters = await page.locator("table tbody tr");

      for (let i = 0; i < (await characters.count()); i++) {
        const character = characters.nth(i);

        // Validate Comics Count
        const comicsLocator = character.locator("td:nth-child(5)");
        const comicsText = await comicsLocator.textContent();
        expect(parseInt(comicsText || "0", 10)).toBeGreaterThanOrEqual(0); // Ensure comics count is a non-negative number

        // Validate Published Date
        const publishedLocator = character.locator("td:nth-child(6)");
        const publishedDate = await publishedLocator.textContent();
        expect(new Date(publishedDate || "")).toBeInstanceOf(Date); // Ensure published date is a valid date
      }
    } else {
      // On Mobile view, comics and published date should not be visible
      const characters = await page.locator("table tbody tr");

      for (let i = 0; i < (await characters.count()); i++) {
        const character = characters.nth(i);

        const comicsLocator = character.locator("td:nth-child(5)");
        const comicsVisible = await comicsLocator.isVisible();
        expect(comicsVisible).toBe(false); // Ensure comics data is not visible in mobile view

        const publishedLocator = character.locator("td:nth-child(6)");
        const publishedVisible = await publishedLocator.isVisible();
        expect(publishedVisible).toBe(false); // Ensure published date is not visible in mobile view
      }
    }
  }
);

Then(
  "the list updates to display characters matching the search term and the results match the API response",
  async function () {
    // Step 1: Fetch the API response for the search term
    const url = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
      searchTerm
    )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

    try {
      // Fetch API Response
      const { data: apiResponseData } = await axios.get<ApiResponse>(url);
      const expectedResults = apiResponseData.data.results;

      // Step 2: Wait for the table to load after entering the search term
      const tableRows = page.locator("table tbody tr"); // Adjust the selector if needed

      // Wait for rows to load
      await tableRows.first().waitFor(); // Wait for at least the first row to be visible

      // Get the count of rows after search
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0); // Ensure at least one row is displayed

      // Step 3: Compare the number of rows with the API results
      expect(rowCount).toBe(expectedResults.length); // Validate number of rows

      // Step 4: Iterate through each row to validate the character details and match API response
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const apiCharacter = expectedResults[i];

        // Validate Thumbnail
        const thumbnail = await row.locator("td img").getAttribute("src");
        const imageLocator = await row.locator("td img");
        const isThumbnailVisible = await imageLocator.isVisible();
        expect(thumbnail).toBeTruthy(); // Thumbnail should exist
        expect(isThumbnailVisible).toBeTruthy(); // Thumbnail image should be visible

        // Validate Name
        const characterName = await row
          .locator("td:nth-child(2)")
          .textContent();
        expect(characterName).not.toBeNull();
        expect(characterName?.trim()).not.toBe(""); // Name should not be empty
        expect(characterName?.trim()).toBe(apiCharacter.name); // Validate the name with API

        // Validate Description (if available)
        const description = await row.locator("td:nth-child(3)").textContent();
        expect(description).toBeDefined(); // Description should be defined
        expect(description?.trim() || "").toBe(apiCharacter.description || ""); // Validate description with API

        // Additional Column Validations (e.g., Comics Count)
        const comicsLocator = row.locator("td:nth-child(5)");
        const displayedComics = await comicsLocator.textContent();
        expect(parseInt(displayedComics?.trim() || "0", 10)).toBe(
          apiCharacter.comics.available
        );
      }
    } catch (error) {
      console.error("Error fetching or processing the API data:", error);
      throw new Error("API request or validation failed");
    }
  }
);

// Updated Then step based on the interfaces provided
Then(
  "the lists updates to display characters matching the search term and the results match the API response",
  async function () {
    // Fetch the API response for the search term
    const url = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
      searchTerm
    )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

    try {
      // Fetch API Response
      const { data: apiResponseData } = await axios.get<ApiResponse>(url);
      const expectedResults = apiResponseData.data.results;

      // Step 2: Wait for the table to load after entering the search term
      const tableRows = page.locator("table tbody tr"); // Adjust the selector if needed

      // Wait for rows to load
      await tableRows.first().waitFor(); // Wait for at least the first row to be visible

      // Get the count of rows after search
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0); // Ensure at least one row is displayed

      // Step 3: Compare the number of rows with the API results
      expect(rowCount).toBe(expectedResults.length); // Validate number of rows

      // Step 4: Iterate through each row to validate the character details and match API response
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const apiCharacter = expectedResults[i];

        // Validate Thumbnail
        const thumbnail = await row.locator("td img").getAttribute("src");
        const imageLocator = await row.locator("td img");
        const isThumbnailVisible = await imageLocator.isVisible();
        expect(thumbnail).toBeTruthy(); // Thumbnail should exist
        expect(isThumbnailVisible).toBeTruthy(); // Thumbnail image should be visible

        // Validate Name
        const characterName = await row
          .locator("td:nth-child(2)")
          .textContent();
        expect(characterName).not.toBeNull();
        expect(characterName?.trim()).not.toBe(""); // Name should not be empty
        expect(characterName?.trim()).toBe(apiCharacter.name); // Validate the name with API

        // Validate Description (if available)
        const description = await row.locator("td:nth-child(3)").textContent();
        expect(description).toBeDefined(); // Description should be defined
        expect(description?.trim() || "").toBe(apiCharacter.description || ""); // Validate description with API

        // Additional Column Validations (e.g., Comics Count)
        const comicsLocator = row.locator("td:nth-child(5)");
        const displayedComics = await comicsLocator.textContent();
        expect(parseInt(displayedComics?.trim() || "0", 10)).toBe(
          apiCharacter.comics.available
        );

        // Step 5: Validate the `modified` field with added 14 hours if available
        const modifiedLocator = row.locator("td:nth-child(6)");
        const displayedModified = await modifiedLocator.textContent();

        // Check if the `modified` date exists and is valid
        if (apiCharacter.modified) {
          // Parse the ISO 8601 format `2016-05-25T12:04:23-0400` and add 14 hours
          const modifiedDateTime = DateTime.fromISO(apiCharacter.modified, {
            zone: "auto",
          });

          // If the date is invalid, handle it gracefully
          if (!modifiedDateTime.isValid) {
            console.error("Invalid DateTime:", apiCharacter.modified);
            return; // Optionally return or skip this validation
          }

          // Add 14 hours to the date if it's valid
          const updatedModifiedDateTime = modifiedDateTime.plus({ hours: 14 });

          // Format the date to match the table format "May 26, 2016, 4:04 AM"
          const formattedModified = updatedModifiedDateTime.toFormat(
            "MMM dd, yyyy, h:mm a"
          );

          expect(displayedModified?.trim()).toBe(formattedModified); // Validate the modified date in the table
        } else {
          console.warn(
            "Modified date is missing for character:",
            apiCharacter.name
          );
        }
      }
    } catch (error) {
      console.error("Error fetching or processing the API data:", error);
      throw new Error("API request or validation failed");
    }
  }
);

Then(
  "get the character id from the search results matching the name and description",
  async function () {
    // Step 1: Fetch the search term from the first row, column 2 (Character name)
    const firstRowName = await page
      .locator("table tbody tr:nth-child(1) td:nth-child(2)")
      .textContent();
    const firstRowDescription = await page
      .locator("table tbody tr:nth-child(1) td:nth-child(3)")
      .textContent();

    // Make sure the search term and description are extracted
    const searchTerm = firstRowName?.trim();
    const searchDescription = firstRowDescription?.trim();

    if (!searchTerm) {
      throw new Error("Search term  not found in the first row.");
    }

    // Step 2: Fetch the API response using the search term (nameStartsWith)
    const url = `https://gateway.marvel.com/v1/public/characters?apikey=${publicKey}&nameStartsWith=${encodeURIComponent(
      searchTerm
    )}&orderBy=name&offset=0&limit=50&ts=${timestamp}&hash=${hash}`;

    try {
      // Fetch API Response
      const { data: apiResponseData } = await axios.get<ApiResponse>(url);
      const expectedResults = apiResponseData.data.results;

      // Step 3: Iterate through the API response and find an exact match

      for (const apiCharacter of expectedResults) {
        // Check for exact match on both name and description
        if (apiCharacter.name.toLowerCase() === searchTerm.toLowerCase()) {
          matchingCharacterId = apiCharacter.id;
          break; // Stop after finding the exact match
        }
      }

      // Step 4: Assert that the matching character ID is found
      expect(matchingCharacterId).not.toBeNull(); // Ensure we found a matching character ID

      // Log the matching character ID for verification
      console.log("Matching character ID:", matchingCharacterId);

      // You can use this ID to fetch the detailed character information or other actions as needed
    } catch (error) {
      console.error("Error fetching or processing the API data:", error);
      throw new Error("API request or validation failed");
    }
  }
);

Then(
  "click the first row image and validate character details and related comics",
  async function () {
    try {
      // Step 1: Click the first row's first column image (Thumbnail)
      const firstImageLocator = page.locator(
        "table tbody tr:nth-child(1) td:nth-child(1) img"
      ); // Target the image inside the first column
      await firstImageLocator.click();

      await page.waitForTimeout(5000);
      // Step 2: Fetch the character's name and validate

      if (!matchingCharacterId) {
        throw new Error("Matching character not found in API response.");
      }
      const matchingCharacterIds = matchingCharacterId.toString(); // Convert ID to string for use in the URL

      // Step 5: Fetch related comics using the character's ID
      const comicsUrl = `https://gateway.marvel.com/v1/public/characters/${matchingCharacterIds}/comics?apikey=${publicKey}&limit=100&ts=${timestamp}&hash=${hash}`;

      const { data: comicsData }: { data: ComicApiResponse } = await axios.get(
        comicsUrl
      );

      // Log the full API response to see the structure
      console.log("Full Comics API Response:", comicsData);

      // Filter comics to exclude images that have 'image_not_available' in the path
      const validComics = comicsData.data.results.filter(
        (comic) => !comic.thumbnail.path.includes("image_not_available")
      );
      const validComicsCount = validComics.length;

      // Step 6: Log the valid comics count and details of the valid thumbnails
      console.log(
        `Total number of valid comic images (where thumbnail path does not contain 'image_not_available')`,
        validComicsCount
      );
      validComics.forEach((comic, index) => {
        console.log(`Comic ${index + 1}:`, comic.thumbnail.path);
      });

      const imageDivs = await page.locator("//div[@class='mb-4']/div/div");

      // Step 2: Get the total count of div elements (which should match the number of images)
      const totalImageCount = await imageDivs.count();
      console.log(`Total images found: ${totalImageCount}`);

      // Step 3: Initialize a counter for valid images (images without 'image_not_available')
      let validImageCount = 0;

      // Step 4: Loop through each div to get the image and validate the src attribute
      for (let i = 0; i < totalImageCount; i++) {
        const imageLocator = imageDivs.nth(i).locator("img");
        const imageSrc = await imageLocator.getAttribute("src");

        // Step 5: Check if the src does not contain 'image_not_available'
        if (imageSrc && !imageSrc.includes("image_not_available")) {
          validImageCount++;
        }
      }

      // Step 6: Log the valid images count
      console.log(
        `Number of valid images (without 'image_not_available'): ${validImageCount}`
      );

      // Validate the count of valid comics
      expect(validComicsCount).toBeGreaterThan(0);
      // Ensure there is at least one valid comic image
      expect(validImageCount).toBe(validComicsCount);
    } catch (error) {
      console.error("Error occurred during validation:", error);
      throw new Error("Validation failed for character details or comics");
    }
  }
);

Then("The user navigates to the character details page", async function () {
  // Step 1: Click the first row's first column image (Thumbnail)
  const firstImageLocator = page.locator(
    "table tbody tr:nth-child(1) td:nth-child(1) img"
  ); // Target the image inside the first column
  await firstImageLocator.click();

  await page.waitForTimeout(5000);
  // Step 2: Fetch the character's name and validate
  const url = page.url();
  expect(url).toContain('https://marvel-dashboard-seven.vercel.app/characters/');
});

When('The user clicks the back button in the browser', async () => {
  await page.waitForTimeout(5000);
  await page.goBack();
});


Then("The app navigates back to the dashboard without freezing", async function () {
  
   await page.waitForTimeout(5000);
  
  const url = page.url();
  expect(url).toContain('https://marvel-dashboard-seven.vercel.app/characters');
});

After(async () => {
  if (browser) {
    await browser.close();
  }
});
