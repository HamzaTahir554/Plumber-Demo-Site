import {test,expect} from '@playwright/test';
test('route content never inserts a temporary loading layout',async({page})=>{
 await page.goto('/services');await expect(page.locator('.page-loading')).toHaveCount(0);await expect(page.locator('.hero-banner')).toBeVisible();
 await page.locator('#main-nav a[href="/commercial"]').click();await expect(page.locator('.hero-banner h1')).toBeVisible();await expect(page.locator('.page-loading')).toHaveCount(0);
});
