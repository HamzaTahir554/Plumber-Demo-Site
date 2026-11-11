import { test, expect } from '@playwright/test';

test('glass header and ordered process cards fit all requested widths', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 901, 960, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.site-header')).toBeVisible();
    const header = await page.locator('.site-header').evaluate(element => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const rgb = value => value.match(/[\d.]+/g).map(Number);
      const composite = (front, back) => front.slice(0, 3).map((channel, index) => channel * (front[3] ?? 1) + back[index] * (1 - (front[3] ?? 1)));
      const rgba = rgb(style.backgroundColor);
      const luminance = channels => channels.map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
      const glass = composite(rgba, [0, 0, 0]);
      const contrast = ['.brand-label strong', '.primary-nav > a', '.nav-emergency'].map(selector => {
        const target = element.querySelector(selector);
        const foreground = luminance(rgb(getComputedStyle(target).color));
        const surface = selector.startsWith('.brand') ? getComputedStyle(element.querySelector('.brand-label')) : selector.startsWith('.primary') ? (innerWidth > 900 ? getComputedStyle(target) : getComputedStyle(element.querySelector('.primary-nav'))) : getComputedStyle(target);
        const background = luminance(composite(rgb(surface.backgroundColor), glass));
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
      });
      return { left: bounds.left, right: bounds.right, blur: style.backdropFilter, alpha: rgba[3], contrast };
    });
    expect(header.left).toBeGreaterThan(0);
    expect(header.right).toBeLessThan(width);
    expect(header.blur).toContain('blur(14px)');
    expect(header.alpha).toBeLessThanOrEqual(.2);
    await expect(page.locator('.brand-label strong').first()).not.toHaveCSS('text-shadow', 'none');
    if (width > 900) {
      const cta = await page.locator('.nav-cta').boundingBox();
      expect(cta.x + cta.width).toBeLessThan(header.right - 10);
    }
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

test('text hover preserves layout, selection, and editable controls', async ({ page }) => {
  await page.goto('/');
  const heading = page.locator('.hero-banner h1');
  const paragraph = page.locator('.hero-banner .lead');
  await heading.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  const original = await paragraph.boundingBox();
  await paragraph.hover();
  await expect(paragraph).toHaveCSS('filter', 'brightness(0.94)');
  await expect(paragraph).not.toHaveCSS('cursor', 'pointer');
  const hovered = await paragraph.boundingBox();
  for (const key of ['x', 'y', 'width', 'height']) expect(Math.abs(hovered[key] - original[key])).toBeLessThan(.1);
  await heading.hover();
  await expect(heading).toHaveCSS('translate', '0px -2px');
  await expect(paragraph).toHaveCSS('filter', 'none');
  await paragraph.evaluate(element => {
    const range = document.createRange(); range.selectNodeContents(element);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
  });
  await paragraph.hover();
  await expect(paragraph).toHaveCSS('filter', 'none');
  await page.evaluate(() => getSelection().removeAllRanges());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await heading.hover();
  await expect(heading).toHaveCSS('translate', '0px');
  expect(await heading.evaluate(element => Math.max(...getComputedStyle(element).transitionDuration.split(',').map(parseFloat)))).toBeLessThanOrEqual(.001);
  await page.goto('/contact');
  const label = page.locator('label[for=contact-name]');
  await label.hover();
  await expect(label).toHaveCSS('filter', 'brightness(0.98)');
  await page.locator('#contact-name').fill('Example name');
  await expect(page.locator('#contact-name')).toHaveCSS('filter', 'none');
  await page.goto('/privacy');
  const legal = page.locator('.prose p').last();
  await legal.hover();
  await expect(legal).toHaveCSS('filter', 'brightness(0.98)');
  await expect(legal).toHaveCSS('translate', 'none');
});

test('emergency buttons stay readable, stable, and functional across layouts', async ({ page }) => {
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const header = page.locator('.site-header');
    await header.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
    if (width < 901) await page.getByRole('button', { name: 'Open navigation menu' }).click();
    const emergency = page.locator(width < 901 ? '.nav-mobile-emergency' : '.nav-emergency');
    await expect(emergency).toBeVisible();
    await expect(emergency).toHaveCSS('color', 'rgb(11, 53, 102)');
    const bounds = await header.boundingBox();
    await emergency.hover();
    await expect(emergency).toHaveCSS('background-color', 'rgb(198, 40, 40)');
    await expect(emergency).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(emergency.locator('svg')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(emergency.locator('svg')).toHaveCSS('transform', 'none');
    await expect(emergency).toHaveCSS('animation-iteration-count', '1');
    expect(await header.boundingBox()).toEqual(bounds);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/transparent-emergency-${width}.png` });
    await emergency.click();
    await expect(page).toHaveURL(/\/emergency$/);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.nav-emergency').hover();
  await expect(page.locator('.nav-emergency')).toHaveCSS('animation-name', 'none');
});
