import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';

const routes = ['/', '/services', '/services/leak-repair', '/services/drain-cleaning', '/services/water-heaters', '/services/toilet-fixture-repair', '/services/pipe-repair', '/services/sump-pumps', '/problem-finder', '/service-area', '/projects', '/maintenance', '/residential', '/commercial', '/emergency', '/about', '/contact', '/reviews', '/accessibility', '/privacy'];

test('all routes load with a title and working images', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h1')).toBeVisible();
    expect(await page.title()).toContain('Company name');
    const imageProblems = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src));
    expect(imageProblems, `broken images on ${route}`).toEqual([]);
  }
  for (const asset of readdirSync('public/assets/images/enhanced')) {
    const response = await page.request.get(`/assets/images/enhanced/${asset}`);
    expect(response.status(), asset).toBe(200);
    expect(response.headers()['content-type'], asset).toContain(asset.endsWith('.png') ? 'image/png' : 'image/jpeg');
  }
  expect(errors).toEqual([]);
});

test('mobile navigation, chat, form errors, and display settings work', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/floating-menu-mobile.png' });
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Emergency info' })).toBeVisible();
  await page.getByRole('button', { name: 'Show service pages' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Sump pump service' }).click();
  await expect(page.locator('main h1')).toHaveText('Sump pump service');
  await expect(page.locator('main h1')).toBeFocused();
  await page.getByRole('button', { name: 'Open demo chat' }).click();
  await page.getByLabel('Ask the demo plumbing guide').fill('I smell gas');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('log')).toContainText('leave the area immediately');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open demo chat' })).toBeVisible();
  await expect(page.locator('.chat-panel')).toHaveCount(0);
  await page.goto('/contact');
  await expect(page.getByRole('button', { name: 'Open accessibility settings' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Accessibility options' }).click();
  await page.getByRole('button', { name: 'Higher contrast: Off' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  await page.getByRole('button', { name: 'Reduce motion: Off' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-reduce-motion', 'yes');
  await expect(page.locator('.route-surface')).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Escape');
});

test('navigation and button motion preserve keyboard and reduced-motion behavior', async ({ page }) => {
  await page.goto('/');
  const servicesToggle = page.getByRole('button', { name: 'Show service pages' });
  await servicesToggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Find the right service' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(servicesToggle).toBeFocused();
  await expect(page.locator('#service-submenu')).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).hover();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })).toHaveCSS('color', 'rgb(7, 81, 174)');
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
  await page.setViewportSize({ width: 375, height: 812 });
  const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
  await menuToggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home' })).toBeFocused();
  await servicesToggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Find the right service' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(servicesToggle).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.service-card').first().hover();
  await expect(page.locator('.service-card').first()).toHaveCSS('transform', 'none');
});

test('floating header stays centered, clears hero copy, and keeps mobile navigation in view', async ({ page }) => {
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('.site-header').evaluate(header => header.getAnimations().forEach(animation => animation.finish()));
    await page.locator('.route-surface').evaluate(surface => surface.getAnimations().forEach(animation => animation.finish()));
    const layout = await page.evaluate(() => {
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const hero = document.querySelector('.hero-banner').getBoundingClientRect();
      const heading = document.querySelector('.hero-banner h1').getBoundingClientRect();
      return { headerTop: header.top, headerBottom: header.bottom, left: header.left, rightGap: innerWidth - header.right, width: header.width, heroTop: hero.top, headingTop: heading.top, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(layout.headerTop, `${width}px header top`).toBe(width <= 680 ? 14 : 16);
    expect(Math.abs(layout.left - layout.rightGap), `${width}px centered header`).toBeLessThan(1);
    expect(layout.width, `${width}px header width`).toBeLessThanOrEqual(1320);
    expect(layout.heroTop).toBe(0);
    expect(layout.headingTop, `${width}px hero copy`).toBeGreaterThan(layout.headerBottom + 8);
    expect(layout.overflow, `${width}px overflow`).toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
    await expect.poll(() => page.locator('.site-header').evaluate(header => header.getBoundingClientRect().top)).toBe(layout.headerTop);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const panel = await page.locator('#main-nav').evaluate(nav => {
    const bounds = nav.getBoundingClientRect();
    return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  expect(panel.left).toBeGreaterThanOrEqual(0);
  expect(panel.right).toBeLessThanOrEqual(panel.viewportWidth);
  expect(panel.bottom).toBeLessThanOrEqual(panel.viewportHeight);
  await page.getByRole('button', { name: 'Close navigation menu' }).click();
  await page.getByRole('link', { name: 'Schedule a Service' }).click();
  await expect(page).toHaveURL(/\/contact#booking-wizard$/);
  await expect.poll(() => page.locator('#booking-wizard').evaluate(target => target.getBoundingClientRect().top)).toBeGreaterThan(90);
});

test('decorative wrench follows scroll progress and stops for reduced motion', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('.scroll-tool-track');
  await expect(track).toBeVisible();
  const attachment = await track.evaluate(element => {
    const header = element.closest('.site-header');
    const headerBounds = header.getBoundingClientRect();
    const trackBounds = element.getBoundingClientRect();
    const navBottom = header.querySelector('.nav-cta').getBoundingClientRect().bottom;
    return { insideHeader: header.contains(element), gap: headerBounds.bottom - trackBounds.bottom, leftInset: trackBounds.left - headerBounds.left, rightInset: headerBounds.right - trackBounds.right, navClearance: trackBounds.top - navBottom };
  });
  expect(attachment.insideHeader).toBe(true);
  expect(attachment.gap).toBeGreaterThanOrEqual(0);
  expect(attachment.gap).toBeLessThanOrEqual(2);
  expect(Math.abs(attachment.leftInset - attachment.rightInset)).toBeLessThan(1);
  expect(attachment.navClearance).toBeGreaterThan(0);
  const read = () => track.evaluate(element => ({
    travel: parseFloat(element.style.getPropertyValue('--tool-travel')) || 0,
    distance: element.clientWidth - element.querySelector('.scroll-tool-icon').offsetWidth
  }));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(async () => (await read()).travel).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) / 2, behavior: 'instant' }));
  await expect.poll(async () => { const { travel, distance } = await read(); return travel / distance; }).toBeGreaterThan(.45);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(async () => { const { travel, distance } = await read(); return Math.abs(travel - distance); }).toBeLessThan(2);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(async () => (await read()).travel).toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(track).toBeVisible();
  const mobileAttachment = await track.evaluate(element => {
    const header = element.closest('.site-header').getBoundingClientRect();
    const trackBounds = element.getBoundingClientRect();
    const brandBottom = document.querySelector('.site-header .brand').getBoundingClientRect().bottom;
    const menuBottom = document.querySelector('.site-header .nav-toggle').getBoundingClientRect().bottom;
    return { gap: header.bottom - trackBounds.bottom, clearance: trackBounds.top - Math.max(brandBottom, menuBottom) };
  });
  expect(mobileAttachment.gap).toBeLessThanOrEqual(2);
  expect(mobileAttachment.clearance).toBeGreaterThanOrEqual(0);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' }));
  await expect.poll(async () => (await read()).travel).toBeGreaterThan(50);
  await page.screenshot({ path: 'test-results/attached-header-mobile.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('display', 'none');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(track).toHaveCSS('display', 'none');
});

test('NEXT STEP and footer share one continuous photo layer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/residential');
    await expect(page.locator('.request-cta')).toBeVisible();
    const layout = await page.evaluate(() => {
      const shell = document.querySelector('.site-outro-shell');
      const cta = document.querySelector('.request-cta');
      const footer = document.querySelector('.footer');
      const ctaBounds = cta.getBoundingClientRect();
      const footerBounds = footer.getBoundingClientRect();
      return {
        boundaryGap: footerBounds.top - ctaBounds.bottom,
        backdropHeight: parseFloat(getComputedStyle(shell).getPropertyValue('--outro-height')),
        combinedHeight: ctaBounds.height + footerBounds.height,
        image: getComputedStyle(shell, '::before').backgroundImage,
        size: getComputedStyle(shell, '::before').backgroundSize,
        ctaBackground: getComputedStyle(cta).backgroundImage,
        footerBackground: getComputedStyle(footer).backgroundImage,
        overflow: document.documentElement.scrollWidth - innerWidth
      };
    });
    expect(Math.abs(layout.boundaryGap), `${width}px CTA/footer boundary`).toBeLessThanOrEqual(1);
    expect(Math.abs(layout.backdropHeight - layout.combinedHeight), `${width}px shared photo height`).toBeLessThanOrEqual(1);
    expect(layout.image).toContain('water-wave-banner.jpg');
    expect(layout.size.split(',').map(value => value.trim())).toEqual(['cover', 'cover']);
    expect(layout.ctaBackground).toBe('none');
    expect(layout.footerBackground).toBe('none');
    expect(layout.overflow).toBeLessThanOrEqual(1);
    await page.evaluate(() => {
      const boundary = document.querySelector('.request-cta').getBoundingClientRect().bottom + scrollY;
      scrollTo({ top: boundary - innerHeight / 2, behavior: 'instant' });
    });
    if (width !== 768) await page.screenshot({ path: `test-results/outro-boundary-${width}.png` });
  }
});

test('emergency accessibility control and footer control open the same settings', async ({ page }) => {
  await page.goto('/emergency');
  await expect(page.locator('.floating-tools .access-launcher')).toHaveCount(0);
  const emergencyControl = page.locator('.emergency-access-panel button');
  await emergencyControl.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Accessibility options' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(emergencyControl).toBeFocused();
  await page.goto('/about');
  await page.locator('.footer-bottom').getByRole('button', { name: 'Accessibility options' }).click();
  await expect(page.getByRole('dialog', { name: 'Accessibility options' })).toBeVisible();
});

test('review examples are labeled as samples while verified reviews are absent', async ({ page }) => {
  await page.goto('/reviews');
  await expect(page.locator('.review-card--sample')).toHaveCount(2);
  await expect(page.locator('.review-sample-label')).toHaveCount(2);
  await expect(page.locator('.review-card:not(.review-card--sample)')).toHaveCount(0);
  await expect(page.locator('.google-reviews')).toContainText('No customer rating or testimonial is claimed here.');
});

test('representative card sections fit desktop and mobile without overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const sections = [
    ['/', '.service-grid', 'services'],
    ['/', '.audience-grid', 'audiences'],
    ['/', '.process-grid--interactive', 'process'],
    ['/maintenance', '.maintenance-grid', 'maintenance'],
    ['/projects', '.gallery-grid', 'gallery'],
    ['/emergency', '.emergency-grid', 'emergency'],
    ['/contact', '.contact-forms', 'forms'],
    ['/reviews', '.google-reviews', 'reviews']
  ];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, selector, name] of sections) {
      await page.goto(route);
      const section = page.locator(selector).first();
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${name} at ${width}px`).toBeLessThanOrEqual(1);
      if (['services', 'process', 'emergency', 'reviews'].includes(name)) {
        await section.screenshot({ path: `test-results/${name}-${width}.png` });
      }
    }
  }
});

test('footer copy stays readable and header motion respects display settings', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.site-header')).toHaveCSS('animation-name', 'header-enter');
    for (const contrast of ['normal', 'high']) {
      await page.evaluate(value => { document.documentElement.dataset.contrast = value; }, contrast);
      const ratios = await page.locator('.footer').evaluate(footer => {
        const rgb = value => value.match(/\d+/g).slice(0, 3).map(Number);
        const luminance = value => {
          const channels = rgb(value).map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
          return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
        };
        const background = luminance(getComputedStyle(footer).backgroundColor);
        const selectors = ['.footer-brand p', '.footer-demo', '.footer-grid h2', '.footer-grid > div:nth-child(2) > a', '.footer-contact', '.footer-bottom > span', '.footer-bottom button', '.footer-brand .brand-label small'];
        return selectors.map(selector => {
          const foreground = luminance(getComputedStyle(footer.querySelector(selector)).color);
          return { selector, ratio: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05) };
        });
      });
      for (const { selector, ratio } of ratios) expect(ratio, `${selector} at ${width}px in ${contrast} mode`).toBeGreaterThanOrEqual(4.5);
    }
  }
  await page.evaluate(() => { document.documentElement.dataset.contrast = 'normal'; });
  const logo = page.locator('.site-header .brand img');
  await expect(logo).toHaveCSS('animation-name', 'logo-arrive');
  await page.locator('.site-header .brand').hover();
  await expect.poll(() => logo.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  const headerLink = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' });
  await headerLink.hover();
  await expect.poll(() => headerLink.evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('1');
  await expect.poll(() => headerLink.evaluate(element => getComputedStyle(element, '::before').borderRadius)).toBe('10px');
  const headerCta = page.locator('.nav-cta .bubble-button');
  await headerCta.hover({ position: { x: 12, y: 12 } });
  await expect(headerCta).toHaveCSS('overflow', 'hidden');
  await expect.poll(() => headerCta.evaluate(element => getComputedStyle(element, '::after').opacity)).toBe('1');
  expect(await headerCta.evaluate(element => Math.abs(parseFloat(element.style.getPropertyValue('--bubble-x')) - 12))).toBeLessThan(2);
  expect(await headerCta.evaluate(element => Math.abs(parseFloat(element.style.getPropertyValue('--bubble-y')) - 12))).toBeLessThan(3);
  await expect.poll(() => headerCta.evaluate(element => getComputedStyle(element, '::after').pointerEvents)).toBe('none');
  await expect(headerCta.locator('.lucide-arrow-right')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 3, 0)');
  await expect(headerCta).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 3)');
  const emergencyLink = page.locator('.nav-emergency');
  await emergencyLink.hover();
  await expect(emergencyLink).toHaveCSS('background-color', 'rgb(198, 40, 40)');
  await expect(emergencyLink).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(emergencyLink).toHaveCSS('animation-name', 'emergency-nudge');
  const serviceToggle = page.getByRole('button', { name: 'Show service pages' });
  await serviceToggle.hover();
  await expect.poll(() => serviceToggle.evaluate(element => getComputedStyle(element, '::before').display)).toBe('none');
  const footerLink = page.locator('.footer-grid > div:nth-child(2) > a').first();
  await footerLink.hover();
  await expect(footerLink).toHaveCSS('text-decoration-line', 'underline');
  const footerButton = page.locator('.footer-bottom button');
  await footerButton.hover();
  await expect(footerButton).toHaveCSS('text-decoration-line', 'underline');
  const footerCta = page.locator('.footer-cta');
  await footerCta.hover({ position: { x: 12, y: 12 } });
  await expect.poll(() => footerCta.evaluate(element => getComputedStyle(element, '::after').opacity)).toBe('1');
  await expect(footerCta).toHaveCSS('color', 'rgb(7, 60, 126)');
  await expect(footerCta).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 3)');
  await page.locator('.footer').screenshot({ path: 'test-results/footer-bubble.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await footerLink.hover();
  await expect.poll(() => headerLink.evaluate(element => getComputedStyle(element, '::before').transitionDuration)).toBe('0s');
  await headerCta.hover();
  await expect.poll(() => headerCta.evaluate(element => getComputedStyle(element, '::after').transitionDuration)).toBe('0s');
  await page.reload();
  await expect(page.locator('.site-header')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.site-header .brand img')).toHaveCSS('animation-name', 'none');
  await page.evaluate(() => { document.documentElement.dataset.reduceMotion = 'yes'; });
  await footerCta.hover();
  await expect.poll(() => footerCta.evaluate(element => getComputedStyle(element, '::after').transitionDuration)).toBe('0s');
});

test('problem finder explains its recommendation and carries notes only with consent', async ({ page }) => {
  await page.goto('/problem-finder');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('alert')).toContainText('Choose the issue');
  await page.getByRole('radio', { name: 'Water leak' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: 'Under a sink' }).check();
  await page.getByLabel('Optional details in your own words').fill('Water is dripping below the kitchen sink.');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('POSSIBLE SERVICE MATCH', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leak detection & repair' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Include my optional notes in the demo request form' }).check();
  await page.getByRole('link', { name: 'Prepare a service request' }).click();
  await expect(page.locator('#booking-service')).toHaveValue('leak-repair');
  await expect(page.locator('#booking-issue')).toHaveValue('Water is dripping below the kitchen sink.');
});

test('booking wizard validates steps and never confirms a booking', async ({ page }) => {
  await page.goto('/contact?service=leak-repair#booking-wizard');
  await expect(page.locator('#booking-service')).toHaveValue('leak-repair');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Check these details:')).toBeVisible();
  await page.locator('#booking-zip').fill('12345');
  await page.getByRole('button', { name: 'Check ZIP' }).click();
  await expect(page.getByRole('status')).toContainText('coverage has not been provided');
  await page.locator('#booking-address').fill('123 Example Street');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#booking-date').fill(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  await page.locator('#booking-time').selectOption('morning');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#booking-name').fill('Alex Customer');
  await page.locator('#booking-phone').fill('5551234567');
  await page.locator('#booking-email').fill('alex@example.com');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Review your details' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish demo review' }).click();
  await expect(page.getByText('No request was sent and no appointment was booked.')).toBeVisible();
});

test('ZIP checker and gallery avoid unverified coverage and project claims', async ({ page }) => {
  await page.goto('/service-area');
  await page.locator('#service-area-zip').fill('bad');
  await page.getByRole('button', { name: 'Check ZIP' }).click();
  await expect(page.getByRole('status')).toContainText('five-digit U.S. ZIP code');
  await page.locator('#service-area-zip').fill('12345');
  await page.getByRole('button', { name: 'Check ZIP' }).click();
  await expect(page.getByRole('status')).toContainText('coverage has not been provided');
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Commercial' }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(1);
  await expect(page.getByText('Verified photo pairs needed')).toBeVisible();
});

test('finder, booking, gallery, forms, and cards show restrained feedback', async ({ page }) => {
  await page.goto('/problem-finder');
  await page.getByRole('radio', { name: 'Water leak' }).check();
  await expect(page.locator('.problem-choice.is-selected .problem-choice-check')).toHaveCSS('opacity', '1');

  await page.goto('/contact');
  await page.locator('#booking-service').selectOption('leak-repair');
  await page.locator('.booking-wizard').getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('.booking-progress li.done > span')).toHaveCSS('animation-name', 'progress-check-in');
  await page.locator('#contact-name').focus();
  await expect(page.locator('#contact-name')).toHaveCSS('border-color', 'rgb(7, 87, 200)');
  await page.locator('#contact-name').evaluate(input => input.blur());
  await page.locator('.contact-forms .form-card').last().getByRole('button', { name: 'Check request details' }).click();
  await expect(page.locator('.contact-forms .error-summary').last()).toHaveCSS('animation-name', 'form-feedback-in');

  await page.goto('/projects');
  await page.getByRole('button', { name: 'Residential' }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(3);
  await expect(page.locator('.gallery-card').first()).toHaveCSS('animation-name', 'gallery-filter-in');
  await expect(page.getByRole('status')).toContainText('Showing 3 illustrative images');

  await page.goto('/services');
  const card = page.locator('.service-card').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -4)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('transform', 'none');
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Commercial' }).click();
  await expect(page.locator('.gallery-card')).toHaveCount(1);
  await expect(page.locator('.gallery-card')).toHaveCSS('animation-name', 'none');
});

test('service card details reveal on hover and focus and remain visible on touch', async ({ page, browser }) => {
  await page.goto('/services');
  const card = page.locator('.service-card').first();
  const details = card.locator('.service-card-details');
  await expect(details).toHaveCSS('opacity', '0');
  const cardHeight = await card.evaluate(element => element.getBoundingClientRect().height);
  await card.hover();
  await expect(details).toHaveCSS('opacity', '1');
  await expect(details.locator('p')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await card.screenshot({ path: 'test-results/service-card-hover.png' });
  expect(await card.evaluate(element => element.getBoundingClientRect().height)).toBe(cardHeight);

  await page.mouse.move(0, 0);
  await card.locator('h3 a').focus();
  await expect(details).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(details).toHaveCSS('transition-duration', '0s');

  const touchContext = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  try {
    const touchPage = await touchContext.newPage();
    await touchPage.goto('/services');
    await touchPage.locator('.service-card').first().scrollIntoViewIfNeeded();
    await expect(touchPage.locator('.service-grid').locator('..')).toHaveClass(/is-visible/);
    const touchDetails = touchPage.locator('.service-card-details').first();
    await expect(touchDetails).toHaveCSS('position', 'static');
    await expect(touchDetails).toHaveCSS('opacity', '1');
    await expect(touchPage.locator('.service-card').first()).toHaveCSS('opacity', '1');
    await touchPage.locator('.service-card').first().screenshot({ path: 'test-results/service-card-touch.png' });
  } finally {
    await touchContext.close();
  }
});

test('reflow and reduced motion behave at target widths', async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.service-grid.reveal, .reveal').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.route-surface')).toHaveCSS('animation-name', 'none');
});

test('full-width hero keeps its image, copy, and CTAs usable at target widths', async ({ page }) => {
  for (const width of [390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const hero = page.locator('.hero-banner');
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Reliable Plumbing Solutions for Your Home & Business');
    await expect(page.locator('.hero-banner-image')).toHaveCSS('object-fit', 'cover');
    const layout = await page.evaluate(() => {
      const hero = document.querySelector('.hero-banner').getBoundingClientRect();
      const imageElement = document.querySelector('.hero-banner-image');
      const image = imageElement.getBoundingClientRect();
      const buttons = [...document.querySelectorAll('.hero-banner .hero-actions a')].map(link => link.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        heroWidth: hero.width,
        imageWidth: imageElement.offsetWidth,
        imageHeight: imageElement.offsetHeight,
        heroHeight: hero.height,
        imageCovers: image.left <= hero.left && image.right >= hero.right && image.top <= hero.top && image.bottom >= hero.bottom,
        buttonsInside: buttons.every(button => button.left >= 0 && button.right <= innerWidth && button.top >= hero.top && button.bottom <= hero.bottom)
      };
    });
    expect(layout.overflow, `${width}px overflow`).toBeLessThanOrEqual(1);
    expect(layout.heroWidth).toBe(width);
    expect(layout.imageWidth).toBe(width);
    expect(layout.imageHeight).toBe(Math.round(layout.heroHeight));
    expect(layout.imageCovers, `${width}px image crop`).toBe(true);
    expect(layout.buttonsInside, `${width}px CTA position`).toBe(true);
  }
  const schedule = page.getByRole('link', { name: 'Schedule a Service' });
  await schedule.hover();
  await expect(schedule).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
  await schedule.focus();
  await expect(schedule).toBeFocused();
  await schedule.click();
  await expect(page).toHaveURL(/\/contact#booking-wizard$/);
  await page.goto('/');
  await page.getByRole('link', { name: /Call Now/ }).click();
  await expect(page).toHaveURL(/\/contact#contact-details$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-banner-image')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.hero-banner h1')).toHaveCSS('animation-name', 'none');
});

test('all routes share hero geometry and white text', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const hero = page.locator('main .hero-banner');
      await expect(hero, `${route} at ${width}px`).toHaveCount(1);
      await expect(hero.locator('.hero-banner-image')).toHaveCSS('object-fit', 'cover');
      await expect(hero.locator('h1')).toBeVisible();
      await expect(hero.locator('.lead')).toBeVisible();
      await expect(hero.locator('.hero-banner-copy')).toHaveCSS('margin-left', '0px');
      const headerBottom = await page.locator('.site-header').evaluate(header => header.getBoundingClientRect().bottom);
      const firstCopyTop = await hero.locator('.hero-banner-copy > :first-child').evaluate(element => element.getBoundingClientRect().top);
      expect(firstCopyTop, `${route} at ${width}px clears floating header`).toBeGreaterThan(headerBottom + 8);
      if (width === 1440) await expect(hero.locator('.hero-banner-inner')).toHaveCSS('min-height', '720px');
      await expect(hero).toHaveCSS('background-color', 'rgb(6, 26, 52)');
      await expect(hero.locator('h1')).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(hero.locator('.lead')).toHaveCSS('color', 'rgb(241, 247, 253)');
    }
  }
});

test('every route has a distinct hero entrance and honors reduced motion', async ({ page }) => {
  const signatures = new Set();
  const startTransforms = new Set();
  for (const route of routes) {
    await page.goto(route);
    const hero = page.locator('main .hero-banner');
    const motion = await hero.evaluate(element => {
      const styles = getComputedStyle(element);
      const heading = element.querySelector('h1');
      const headingEntrance = heading.getAnimations().find(animation => animation.animationName === 'hero-heading-enter');
      headingEntrance?.pause();
      if (headingEntrance) headingEntrance.currentTime = 0;
      return {
        name: element.dataset.heroMotion,
        signature: ['--hero-heading-from', '--hero-body-from', '--hero-photo-from', '--hero-motion-delay']
          .map(property => styles.getPropertyValue(property).trim()).join('|'),
        imageAnimation: getComputedStyle(element.querySelector('.hero-banner-image')).animationName,
        headingAnimation: getComputedStyle(heading).animationName,
        startTransform: getComputedStyle(heading).transform,
        bodyAnimation: getComputedStyle(element.querySelector('.lead')).animationName
      };
    });
    expect(motion.name, route).toBeTruthy();
    expect(motion.signature, route).not.toBe('|||');
    expect(signatures.has(motion.signature), `${route} repeats another hero entrance`).toBe(false);
    expect(motion.imageAnimation).toBe('hero-photo-enter');
    expect(motion.headingAnimation).toBe('hero-heading-enter');
    expect(motion.bodyAnimation).toBe('hero-body-enter');
    expect(motion.startTransform, route).not.toBe('none');
    expect(startTransforms.has(motion.startTransform), `${route} repeats another heading entrance`).toBe(false);
    signatures.add(motion.signature);
    startTransforms.add(motion.startTransform);
  }
  expect(signatures.size).toBe(routes.length);
  expect(startTransforms.size).toBe(routes.length);

  await page.goto('/page-that-does-not-exist');
  await expect(page.locator('main .hero-banner')).toHaveAttribute('data-hero-motion', 'not-found');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/privacy');
  await expect(page.locator('.hero-banner-image')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.hero-banner h1')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.hero-banner .lead')).toHaveCSS('animation-name', 'none');
});

test('secondary page sections reveal once and reduced motion shows content immediately', async ({ page }) => {
  for (const route of ['/commercial', '/maintenance']) {
    await page.goto(route);
    const finalSection = page.locator('main .motion-section').last();
    await finalSection.scrollIntoViewIfNeeded();
    await expect(finalSection).toHaveClass(/is-visible/);
    await expect(finalSection).toHaveCSS('opacity', '1');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/commercial');
  await expect(page.locator('.hero-banner-image')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('main .section > .container').first()).toHaveCSS('opacity', '1');
});

test('desktop and mobile first viewport are reviewable', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/home-desktop.png' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/home-mobile.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/home-mobile-390.png' });
});

test('axe reports no WCAG tagged violations across routes', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    await page.waitForTimeout(500);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const violations = result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);
    expect(violations, route).toEqual([]);
  }
});
