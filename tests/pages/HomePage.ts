import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly logo: Locator;
    readonly menuButton: Locator;
    readonly insuranceMenu: Locator;
    readonly bankingMenu: Locator;
    readonly contactUsButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logo = page.locator("//div[@class='Header-desktop']//ul//li[contains(@class, 'Header-desktop-element')]//a[@href='/home.html']//img[contains(@src, 'Suncorp')]");

        this.menuButton = page.locator('button[aria-label="Open menu"]'); // Update selector for the main menu button
        this.insuranceMenu = page.locator('a[href="/insurance"]'); // Update based on the insurance menu link
        this.bankingMenu = page.locator('a[href="/banking"]'); // Update based on the banking menu link
        this.contactUsButton = page.locator('a[href="/contact-us"]'); // Update based on contact us button link
    }

    async navigateToHomePage(url: string) {
        await this.page.goto(url);
    }

    async clickMenuButton() {
        await this.menuButton.click();
    }

    async navigateToInsurance() {
        await this.insuranceMenu.click();
    }

    async navigateToBanking() {
        await this.bankingMenu.click();
    }

    async clickContactUs() {
        await this.contactUsButton.click();
    }

    
}
