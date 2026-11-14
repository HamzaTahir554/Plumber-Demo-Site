import { test, expect } from '@playwright/test';

test('route motion preserves header, focus, history positions and hash navigation', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('main h1')).toBeVisible();
  await page.evaluate(() => { document.querySelector('.site-header').dataset.persisted = 'yes'; window.scrollTo({top:1000,behavior:'instant'}); });
  const previous = await page.evaluate(() => scrollY);
  await page.locator('#main-nav a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('main h1')).toBeFocused();
  await expect(page.locator('.site-header')).toHaveAttribute('data-persisted', 'yes');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.evaluate(() => scrollTo({top:700,behavior:'instant'}));
  await page.goBack();
  await expect(page).toHaveURL(/\/services$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(previous);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.locator('.craft-categories button').last().click();
  await page.getByRole('link', { name: 'Prepare your questions' }).click();
  await expect(page).toHaveURL(/\/contact#booking-wizard$/);
  await expect(page.locator('#booking-wizard')).toBeFocused();
  await page.reload();
  await expect(page.locator('#booking-wizard')).toBeFocused();
  await page.evaluate(() => scrollTo({top:600,behavior:'instant'}));
  await page.locator('#main-nav a[href="/about"]').click();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
});

test('rapid route changes cancel stale outgoing navigation', async ({ page }) => {
  await page.addInitScript(() => { document.startViewTransition = undefined; });
  await page.goto('/services');
  await page.evaluate(() => {
    document.querySelector('#main-nav a[href="/about"]').click();
    document.querySelector('#main-nav a[href="/services"]').click();
  });
  await page.waitForTimeout(250); // Past the canceled 160ms outgoing animation.
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('route fallback and reduced motion preserve immediate usable navigation', async ({ page }) => {
  await page.addInitScript(() => { document.startViewTransition = undefined; });
  await page.goto('/services');
  await page.locator('#main-nav a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('main h1')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#main-nav a[href="/services"]').click();
  await expect(page.locator('.route-surface')).toHaveCSS('animation-name', 'none');
});

test('FAQ searches answers, filters categories, resets and supports keyboard disclosure', async ({ page }) => {
  await page.goto('/contact#faq');
  const faq = page.locator('.faq-system');
  const search = faq.getByRole('searchbox');
  const total = await faq.locator('details').count();
  await search.fill('HEATER');
  expect(await faq.locator('details').count()).toBeLessThan(total);
  expect(await faq.locator('details').count()).toBeGreaterThan(0);
  await faq.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(search).toBeFocused();
  await faq.getByRole('button', { name: 'Leak Detection & Pipe Repair', exact: true }).click();
  await expect(faq.locator('details')).toHaveCount(2);
  const summary = faq.locator('summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(faq.locator('details').first()).toHaveAttribute('open', '');
  await expect(summary.locator('path').nth(1)).toHaveCSS('opacity', '0');
  await expect(faq.locator('.faq-answer a').first()).toHaveAttribute('href', '/services/leak-repair');
  await search.fill('unmatchedzzzz');
  await expect(faq.locator('.faq-empty')).toBeVisible();
  await faq.getByRole('button', { name: 'Show all answers' }).click();
  await expect(faq.locator('details')).toHaveCount(total);
  await page.setViewportSize({width:320,height:800});
  await faq.getByLabel('Category', {exact:true}).selectOption('Drain Cleaning & Hydro Jetting');
  await expect(faq.locator('details')).toHaveCount(2);
});

test('mobile bar coordinates with hero, navigation, chat, footer and booking', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/services');
  const bar = page.locator('.mobile-contact-bar');
  await expect(bar).toHaveAttribute('aria-hidden','true');
  await page.locator('.service-grid').scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute('aria-hidden','false');
  await expect(bar.getByRole('link', {name:/Call Now/})).toHaveAttribute('href','/contact#contact-details');
  for (const link of await bar.locator('a').all()) expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button',{name:'Open navigation menu'}).click();
  await expect(bar).toHaveAttribute('aria-hidden','true');
  await page.keyboard.press('Escape');
  await expect(bar).toHaveAttribute('aria-hidden','false');
  await page.getByRole('button',{name:'Open demo chat'}).click();
  await expect(bar).toHaveAttribute('aria-hidden','true');
  await page.keyboard.press('Escape');
  await expect(bar).toHaveAttribute('aria-hidden','false');
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute('aria-hidden','true');
  await page.locator('.service-grid').scrollIntoViewIfNeeded();
  await expect(bar).toHaveAttribute('aria-hidden','false');
  await bar.getByRole('link',{name:'Request Service'}).click();
  await expect(page).toHaveURL(/\/contact#booking-wizard$/);
  await expect(bar).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('#booking-wizard')).toBeFocused();
});

test('craftsmanship is honest about missing photos; hotspots resize and work with keyboard and touch', async ({ page, browser }) => {
  await page.goto('/about');
  await page.getByRole('button', {name:'Materials & connections',exact:true}).click();
  await expect(page.locator('.craft-asset-note')).toContainText('Company photography pending');
  await expect(page.locator('.craft-copy h3')).toHaveText('Materials & connections');
  await page.goto('/tests/fixtures/hotspots.html');
  for (const width of [320,768,1440]) {
    await page.setViewportSize({width,height:900});
    const img = await page.locator('.hotspot-image img').boundingBox();
    const spot = await page.getByRole('button', {name:'About Test fitting'}).boundingBox();
    expect(Math.abs(spot.x + spot.width/2 - img.x - img.width*.4)).toBeLessThan(1);
    expect(Math.abs(spot.y + spot.height/2 - img.y - img.height*.6)).toBeLessThan(1);
  }
  const hotspot = page.getByRole('button',{name:'About Test fitting'});
  await hotspot.focus(); await page.keyboard.press('Enter');
  await expect(hotspot).toHaveAttribute('aria-expanded','true');
  await page.getByRole('button',{name:'Close explanation'}).focus();
  await page.keyboard.press('Escape');
  await expect(hotspot).toBeFocused();
  await expect(hotspot).toHaveAttribute('aria-expanded','false');
  const context = await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  const touch = await context.newPage(); await touch.goto('http://127.0.0.1:4173/tests/fixtures/hotspots.html');
  await touch.getByRole('button',{name:'About Test fitting'}).tap();
  await expect(touch.getByRole('button',{name:'About Test fitting'})).toHaveAttribute('aria-expanded','true');
  await context.close();
});

test('mobile bar fits narrow and landscape viewports without blocking the chat control', async ({ page }) => {
  for (const [width,height] of [[320,800],[360,800],[390,844],[430,900],[667,375],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.goto('/services');
    await page.locator('.service-grid').scrollIntoViewIfNeeded();
    const bar=page.locator('.mobile-contact-bar');
    if(width<=680) {
      await expect(bar).toHaveAttribute('aria-hidden','false');
      await expect(bar).toHaveCSS('opacity','1');
      const box=await bar.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x+box.width).toBeLessThanOrEqual(width);
      for(const button of await bar.locator('a').all()) {
        const rect=await button.boundingBox();
        expect(rect.height).toBeGreaterThanOrEqual(44);
        expect(rect.x+rect.width).toBeLessThanOrEqual(width);
      }
      const chat=await page.locator('.chat-launcher').boundingBox();
      expect(chat.y+chat.height).toBeLessThanOrEqual(box.y);
    } else await expect(bar).toHaveCSS('display','none');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  }
});
