import { test, expect } from '@playwright/test';

test('content entrances run once and release hover transforms', async ({ page }) => {
  await page.goto('/residential');
  const panel = page.locator('.editorial-panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveClass(/is-visible/);
  await panel.evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished));
    element.dataset.repeated = '0';
    element.addEventListener('animationstart', () => { element.dataset.repeated = String(Number(element.dataset.repeated) + 1); });
  });
  await panel.hover();
  await expect(panel).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)');
  await page.mouse.move(0, 0);
  await expect(panel).toHaveCSS('transform', 'none');
  await expect(panel).toHaveAttribute('data-repeated', '0');
  await page.evaluate(() => { document.documentElement.dataset.reduceMotion = 'yes'; });
  await panel.hover();
  await expect(panel).toHaveCSS('transform', 'none');
  await expect(panel).toHaveCSS('animation-name', 'none');
});

test('observer setup failure never hides essential sections', async ({ page }) => {
  await page.addInitScript(() => {
    window.IntersectionObserver = class { constructor() { throw new Error('Observer unavailable'); } };
  });
  await page.goto('/residential');
  await page.locator('.editorial-panel').scrollIntoViewIfNeeded();
  await expect(page.locator('.editorial-panel')).toBeVisible();
  await expect(page.locator('.editorial-grid')).toHaveCSS('opacity', '1');
  await expect(page.locator('html')).not.toHaveClass(/js-motion/);
  await page.locator('.footer a[href="/services"]').click();
  await expect(page).toHaveURL(/\/services$/);
});
