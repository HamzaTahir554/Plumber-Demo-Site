import { test, expect } from '@playwright/test';

test('glass header and ordered process cards fit all requested widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.site-header')).toBeVisible();
    const header = await page.locator('.site-header').evaluate(element => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const rgba = style.backgroundColor.match(/[\d.]+/g).map(Number);
      const alpha = rgba[3] ?? 1;
      const luminance = channels => channels.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
      const background = luminance(rgba.slice(0, 3).map(channel => channel * alpha));
      const contrast = ['.brand-label strong', '.primary-nav > a', '.nav-emergency'].map(selector => {
        const foreground = luminance(getComputedStyle(element.querySelector(selector)).color.match(/[\d.]+/g).slice(0, 3).map(Number));
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
      });
      return { left: bounds.left, right: bounds.right, blur: style.backdropFilter, contrast };
    });
    expect(header.left).toBeGreaterThan(0);
    expect(header.right).toBeLessThan(width);
    expect(header.blur).toContain('blur(18px)');
    header.contrast.forEach(ratio => expect(ratio).toBeGreaterThanOrEqual(4.5));
    if ([390, 1440].includes(width)) await page.screenshot({ path: `test-results/glass-header-${width}.png` });
    const process = page.getByRole('list', { name: 'Four steps from problem to request' });
    await process.scrollIntoViewIfNeeded();
    await expect(process.locator('li')).toHaveCount(4);
    const cards = await process.locator('.process-card').evaluateAll(elements => elements.map(element => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, height: bounds.height };
    }));
    expect(Math.max(...cards.map(card => card.height)) - Math.min(...cards.map(card => card.height))).toBeLessThanOrEqual(1);
    cards.forEach(card => { expect(card.left).toBeGreaterThanOrEqual(0); expect(card.right).toBeLessThanOrEqual(width); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    if ([390, 768, 1440].includes(width)) await page.locator('.process-section').screenshot({ path: `test-results/process-redesign-${width}.png`, style: '.site-header { visibility: hidden; }' });
  }
});

test('process motion, footer links, and contact icons respect reduced motion', async ({ page }) => {
  await page.goto('/');
  const process = page.locator('.process-grid--interactive');
  await process.scrollIntoViewIfNeeded();
  await expect(process).toHaveClass(/is-visible/);
  const steps = process.locator('.process-step');
  const delays = await steps.evaluateAll(elements => elements.map(element => parseFloat(getComputedStyle(element).animationDelay)));
  expect(delays[1]).toBeGreaterThan(delays[0]);
  expect(delays[3]).toBeGreaterThan(delays[2]);
  const card = process.locator('.process-card').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -5)');
  const links = page.locator('.footer-grid > div:not(.footer-brand) > a:not(.footer-cta)');
  for (const link of await links.all()) {
    await link.hover();
    await expect(link).toHaveCSS('color', 'rgb(185, 221, 255)');
    await expect.poll(() => link.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element, '::after').transform).a)).toBe(1);
    await expect(link).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, 0)');
  }
  const phone = page.locator('.footer-contact-link').first();
  await phone.focus();
  await expect(phone).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/contact#contact-details$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  await expect(steps.first()).toHaveCSS('animation-name', 'none');
  await phone.hover();
  await expect(phone.locator('svg')).toHaveCSS('transform', 'none');
  await expect(phone).toHaveCSS('transform', 'none');
});
