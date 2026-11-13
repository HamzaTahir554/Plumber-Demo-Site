import { test, expect } from '@playwright/test';

test('scroll motion reverses and chat keeps keyboard behavior', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.section-heading').first();
  const top = await section.evaluate(e => e.getBoundingClientRect().top + scrollY);
  const move = async y => { await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y); await page.waitForTimeout(100); };
  const offset = () => section.evaluate(e => parseFloat(e.style.getPropertyValue('--scroll-offset')));
  await move(top - 780);
  const before = await offset();
  await move(top - 450);
  expect(await offset()).toBeLessThan(before);
  const down = await page.locator('html').evaluate(e => Number(e.style.getPropertyValue('--page-scroll-progress')));
  await move(top - 780);
  expect(await offset()).toBeCloseTo(before, 1);
  expect(await page.locator('html').evaluate(e => Number(e.style.getPropertyValue('--page-scroll-progress')))).toBeLessThan(down);
  const launcher = page.getByRole('button', { name: 'Open demo chat' });
  await expect(launcher.locator('.lucide-bot')).toHaveCount(1);
  await launcher.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.chat-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(launcher).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.floating-tools').evaluate(e => getComputedStyle(e, '::before').display)).toBe('none');
});

test('compact buttons and scroll decorations fit target widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.footer').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    for (const button of await page.locator('.hero-actions .btn, .footer-cta').all()) {
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/scroll-bot-footer.png' });
});
