import { test, expect } from '@playwright/test';

test('comparison supports captured dragging, keyboard, reset and touch', async ({ page, browser }) => {
  await page.goto('/tests/fixtures/comparison.html');
  const slider = page.getByRole('slider');
  await slider.focus(); await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('51');
  await page.keyboard.press('End'); await expect(slider).toHaveValue('100');
  await page.getByRole('button', { name: 'Reset comparison' }).click();
  await expect(slider).toHaveValue('50');
  const box = await slider.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width * .25, box.y + box.height / 2); await page.mouse.up();
  expect(Number(await slider.inputValue())).toBeGreaterThanOrEqual(23);
  expect(Number(await slider.inputValue())).toBeLessThanOrEqual(27);
  const mobile = await browser.newContext({ baseURL:'http://127.0.0.1:4173', hasTouch: true, isMobile: true, viewport: { width:390, height:844 } });
  const touch = await mobile.newPage(); await touch.goto('/tests/fixtures/comparison.html');
  const target = touch.getByRole('slider'); const bounds = await target.boundingBox();
  const session = await mobile.newCDPSession(touch);
  await session.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:bounds.x + bounds.width * .5,y:bounds.y + bounds.height / 2}]});
  await session.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x:bounds.x + bounds.width * .75,y:bounds.y + bounds.height / 2}]});
  await session.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  expect(Number(await target.inputValue())).toBeGreaterThan(65);
  await mobile.close();
});

test('homepage discovery maps to the guide and booking cards preserve selection', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Verified project photos coming soon')).toBeVisible();
  await page.locator('.finder-entry-card').filter({ hasText:'Water leak' }).click();
  await expect(page.getByRole('heading', { name:'A little more detail' })).toBeVisible();
  await page.getByLabel('Under a sink', { exact:true }).check();
  await page.getByRole('button', { name:'Continue', exact:true }).click();
  await expect(page.getByRole('link', {name:'Read about this service'})).toHaveAttribute('href','/services/leak-repair');
  await page.getByRole('link', {name:'Prepare a service request', exact:true}).click();
  await expect(page.locator('#booking-service')).toHaveValue('leak-repair');
  await page.locator('.booking-service-cards input[value="drain-cleaning"]').check();
  await page.getByRole('button', {name:'Next',exact:true}).click();
  await page.getByRole('button', {name:'Back',exact:true}).click();
  await expect(page.locator('#booking-service')).toHaveValue('drain-cleaning');
  await expect(page.locator('.booking-service-cards input[value="drain-cleaning"]')).toBeChecked();
});

test('ripples are bounded and decorative; SVG replay respects reduced motion', async ({ page }) => {
  await page.goto('/');
  const surface = page.locator('.service-card').first();
  await surface.hover();
  await expect(surface.locator('.water-ripple')).toHaveCSS('pointer-events','none');
  await page.goto('/services/drain-cleaning');
  await page.getByRole('button',{name:'Play illustration'}).click();
  await expect(page.locator('.diagram-flow')).toHaveCSS('animation-name','pipe-flow');
  await page.emulateMedia({ reducedMotion:'reduce' });
  await expect(page.locator('.diagram-flow')).toHaveCSS('animation-name','none');
  await expect(page.locator('h1 .heading-word').first()).toHaveCSS('animation-name','none');
});
