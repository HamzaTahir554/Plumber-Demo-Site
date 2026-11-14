import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { faqItems } from '../src/data/faqs.js';

test('homepage uses one project-stories section and all FAQ content lives below contact forms', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.faq-section, .faq-system, .work-gallery')).toHaveCount(0);
  await expect(page.getByText('PLUMBING IMAGE GALLERY',{exact:true})).toHaveCount(0);
  await expect(page.getByText('PROJECT STORIES',{exact:true})).toHaveCount(1);
  await expect(page.locator('.story-card')).toHaveCount(3);
  await expect(page.locator('.project-stories')).toContainText('Portfolio preview');
  await expect(page.getByRole('heading',{name:'Real Work. Lasting Results.',exact:true})).toHaveCount(0);
  await expect(page.getByText('Verified project photos coming soon')).toBeVisible();
  await page.locator('.stories-note a').click();
  await expect(page).toHaveURL(/\/contact#faq$/);
  await expect(page.locator('#faq')).toBeFocused();
  await expect(page.locator('#faq details')).toHaveCount(faqItems.length);
  expect(await page.locator('#faq summary').allTextContents()).toEqual(faqItems.map(item=>item.q));
  expect(await page.locator('#faq .faq-answer p').allTextContents()).toEqual(faqItems.map(item=>item.a));
  expect(await page.evaluate(()=>Boolean(document.querySelector('#contact-details').compareDocumentPosition(document.querySelector('#faq')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  expect(await page.evaluate(()=>Boolean(document.querySelector('#faq').compareDocumentPosition(document.querySelector('.footer')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

test('project stories support keyboard navigation, focus containment, close/back and honest content', async ({ page }) => {
  await page.goto('/');
  const opener=page.getByRole('button',{name:/Kitchen pipe access/});
  await opener.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button',{name:'Back to stories'})).toBeFocused();
  await expect(dialog).toContainText('not a completed company project');
  await expect(dialog.getByRole('heading',{name:'The Challenge',exact:true})).toBeVisible();
  await expect(dialog.getByRole('heading',{name:'Our Approach',exact:true})).toBeVisible();
  await expect(dialog).toContainText('No completed outcome is documented');
  await expect(dialog.getByRole('slider')).toHaveCount(0);
  await dialog.getByRole('button',{name:'Next project story'}).click();
  await expect(dialog.locator('h2')).toHaveText('Water heater equipment');
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('h2')).toHaveText('Commercial pipe room');
  await page.keyboard.press('ArrowLeft');
  await dialog.getByRole('button',{name:'Previous project story'}).click();
  await expect(dialog.locator('h2')).toHaveText('Kitchen pipe access');
  for(let i=0;i<6;i++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true); }
  for(let i=0;i<6;i++) { await page.keyboard.press('Shift+Tab'); expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true); }
  const y=await page.evaluate(()=>scrollY);
  expect((await new AxeBuilder({page}).include('.story-dialog').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
  expect(await page.evaluate(()=>scrollY)).toBe(y);
  expect(await page.evaluate(()=>document.documentElement.style.overflow)).not.toBe('hidden');
  await opener.click(); await page.getByRole('button',{name:'Back to stories'}).click();
  await expect(opener).toBeFocused();
});

test('editorial cards and story controls fit all viewports and honor reduced motion', async ({ page }) => {
  for(const width of [320,390,768,1024,1440,1920]) {
    await page.setViewportSize({width,height:900}); await page.goto('/');
    for(const img of await page.locator('.story-card img').all()) {
      await img.scrollIntoViewIfNeeded(); await img.evaluate(el=>el.decode());
      const box=await img.boundingBox(); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x+box.width).toBeLessThanOrEqual(width);
    }
    if(width<=680) await expect(page.locator('.mobile-contact-bar')).toHaveAttribute('aria-hidden','true');
    await page.locator('.story-open').last().click();
    await expect(page.locator('.story-dialog')).toBeVisible();
    for(const button of await page.locator('.story-dialog button').all()) {
      const box=await button.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y+box.height).toBeLessThanOrEqual(900);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    await page.getByRole('button',{name:'Close project story'}).click();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.story-open').first().hover(); await expect(page.locator('.story-card img').first()).toHaveCSS('transform','none');
  await page.locator('.story-open').first().click(); await expect(page.locator('.story-dialog')).toHaveCSS('animation-name','none');
  await page.keyboard.press('Escape'); await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>document.documentElement.dataset.reduceMotion='yes');
  await page.locator('.story-open').first().click(); await expect(page.locator('.story-dialog')).toHaveCSS('animation-name','none');
});

test('touch users can read and close stories in portrait and landscape', async ({ browser }) => {
  const context=await browser.newContext({baseURL:'http://127.0.0.1:4173',hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  const page=await context.newPage(); await page.goto('/');
  await page.locator('.story-open').first().tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('heading',{name:'The Result',exact:true}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading',{name:'The Result',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Next project story'}).tap();
  await expect(page.locator('.story-dialog h2')).toHaveText('Water heater equipment');
  await page.setViewportSize({width:844,height:390});
  await page.getByRole('button',{name:'Next project story'}).tap();
  await expect(page.locator('.story-dialog h2')).toHaveText('Commercial pipe room');
  await page.getByRole('button',{name:'Close project story'}).tap();
  await expect(page.locator('.story-dialog')).toHaveCount(0); await context.close();
});

test('configured story details and comparison work without stealing range keyboard controls', async ({ page }) => {
  await page.goto('/tests/fixtures/story.html');
  await page.getByRole('button',{name:/Synthetic story A/}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toContainText('Test challenge text.');
  await expect(dialog).toContainText('Test approach text.');
  await expect(dialog).toContainText('Test result text.');
  const slider=dialog.getByRole('slider'); await expect(slider).toBeVisible();
  await slider.focus(); await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('51'); await expect(dialog.locator('h2')).toHaveText('Synthetic story A');
  await dialog.getByRole('button',{name:'Reset comparison'}).click(); await expect(slider).toHaveValue('50');
});
