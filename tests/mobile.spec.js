import { test, expect } from '@playwright/test';
test('mobile glass menu exposes both actions and releases its scroll lock on navigation', async ({ page }) => {
 for (const width of [320,390,768]) {
  await page.setViewportSize({width,height:844}); await page.goto('/');
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await expect(page.locator('html')).toHaveCSS('overflow','hidden');
  await expect(page.locator('.nav-mobile-emergency')).toHaveCSS('background-color','rgb(7, 87, 200)');
  const request=page.locator('.nav-mobile-request'); await expect(request).toBeVisible();
  await request.click(); await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
 }
});
