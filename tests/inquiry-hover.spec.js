import { test, expect } from '@playwright/test';

test('appointment step labels and numbers respond together without changing content', async ({ page }) => {
  await page.goto('/contact');
  const wizard = page.locator('.booking-wizard');
  await expect(wizard.locator('.form-top p')).toContainText('no details are transmitted and no visit is booked');
  for (const step of await wizard.locator('.booking-progress li').all()) {
    await step.hover();
    await expect(step.locator(':scope > span')).toHaveCSS('scale', '1.06');
    await expect(step.locator('small')).toHaveCSS('translate', '0px -2px');
  }
  await wizard.locator('.form-top p').hover();
  await expect(wizard.locator('.form-top p')).toHaveCSS('translate', '0px -2px');
  await wizard.screenshot({ path: 'test-results/inquiry-hover.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await wizard.locator('.booking-progress li').first().hover();
  await expect(wizard.locator('.booking-progress li > span').first()).toHaveCSS('scale', 'none');
});

test('shared banners keep hover distinct from entrance and reduced motion', async ({ page }) => {
  for (const route of ['/', '/commercial', '/contact']) {
    await page.goto(route);
    const banner = page.locator('.hero-banner');
    const lead = banner.locator('.lead');
    await lead.evaluate(e => Promise.all(e.getAnimations().map(a => a.finished)));
    await lead.hover();
    await expect(lead).toHaveCSS('translate', '0px -1px');
    await banner.locator('h1').hover();
    await expect(banner.locator('h1')).toHaveCSS('color', route === '/commercial' ? 'rgb(6, 74, 168)' : 'rgb(193, 226, 255)');
  }
  await page.evaluate(() => { document.documentElement.dataset.reduceMotion = 'yes'; });
  await page.locator('.hero-banner .lead').hover();
  await expect(page.locator('.hero-banner .lead')).toHaveCSS('translate', 'none');
});

test('both outro CTAs have red pointer and keyboard feedback', async ({ page }) => {
  await page.goto('/');
  for (const button of await page.locator('.request-cta .btn').all()) {
    await button.hover();
    await expect(button).toHaveCSS('background-color', 'rgb(198, 40, 40)');
    await expect(button).toHaveCSS('border-top-color', 'rgb(198, 40, 40)');
    await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.mouse.move(0, 0);
    await button.focus();
    await expect(button).toHaveCSS('background-color', 'rgb(198, 40, 40)');
    await expect(button).toHaveCSS('outline-style', 'solid');
    await button.evaluate(e => e.blur());
  }
  await page.locator('.request-cta').screenshot({ path: 'test-results/red-outro.png' });
});
