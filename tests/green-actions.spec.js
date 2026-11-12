import {test,expect} from '@playwright/test';
test('green actions preserve hover, press and blue defaults',async({page})=>{
 await page.goto('/');
 for(const selector of ['.nav-cta .green-action','.hero-actions .green-action','.footer .green-action']) {
  const button=page.locator(selector);await expect(button).toHaveCSS('background-color','rgb(7, 87, 200)');
  await button.hover();await expect.poll(()=>button.evaluate(e=>getComputedStyle(e,'::before').backgroundColor)).toBe('rgb(22, 128, 60)');
  await expect.poll(()=>button.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e,'::before').transform).a)).toBe(1);
  await page.mouse.down();await expect(button).toHaveCSS('background-color','rgb(22, 128, 60)');await expect(button).toHaveCSS('color','rgb(255, 255, 255)');
  await page.mouse.move(0,0);await page.mouse.up();await expect(button).toHaveCSS('background-color','rgb(7, 87, 200)');
 }
});
