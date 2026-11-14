import { chromium, firefox, webkit, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const origin = process.env.SITE_ORIGIN || 'http://127.0.0.1:4174';
const widths = [320,390,768,1024,1440,1920];
const routes = ['/', '/about', '/services/leak-repair', '/services', '/problem-finder', '/contact'];
const results = [];
mkdirSync('reports/phase-two', {recursive:true});
for (const [name, engine, options] of [['Chrome',chromium,{channel:'chrome'}],['Edge',chromium,{channel:'msedge'}],['Firefox',firefox,{}],['WebKit',webkit,{}]]) {
  let browser;
  try { browser = await engine.launch(options); } catch(error) { results.push({name,unavailable:error.message}); continue; }
  const record = {name,version:browser.version(),checks:0,issues:[],errors:[]};
  const page = await browser.newPage();
  page.on('pageerror',error=>record.errors.push(error.message));
  try {
    for (const width of process.env.INTERACTIONS_ONLY ? [] : widths) {
      await page.setViewportSize({width,height:900});
      for (const route of routes) {
        await page.goto(origin+route, {waitUntil:'networkidle'});
        await page.locator('main h1').waitFor();
        const layout = await page.evaluate(() => {
          const header = document.querySelector('.site-header').getBoundingClientRect();
          const hero = document.querySelector('.hero-banner').getBoundingClientRect();
          return {overflow:document.documentElement.scrollWidth-innerWidth, overlap:header.bottom>hero.top+1, broken:[...document.images].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src)};
        });
        record.checks++;
        if(layout.overflow>1||layout.overlap||layout.broken.length) record.issues.push({route,width,...layout});
      }
    }
    await page.setViewportSize({width:1440,height:900});
    await page.goto(origin+'/services');
    await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(()=>scrollTo({top:1000,behavior:'instant'}));
    await page.locator('#main-nav a[href="/about"]').click();
    await expect(page).toHaveURL(origin+'/about');
    await expect(page.locator('main h1')).toBeFocused();
    await page.evaluate(()=>scrollTo({top:700,behavior:'instant'}));
    await page.goBack();
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(1000);
    await page.goForward();
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(700);
    await page.goto(origin+'/about');
    await page.locator('.craftsmanship').scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:'Materials & connections',exact:true}).click();
    await expect(page.locator('.craft-copy h3')).toHaveText('Materials & connections');
    await page.waitForTimeout(700); // Capture the settled category reveal.
    await page.screenshot({path:`reports/phase-two/${name}-craft-1440.png`});
    await page.goto(origin+'/contact#faq');
    const faq = page.locator('.faq-system');
    await faq.getByRole('searchbox').fill('heater');
    await expect(faq.locator('details')).toHaveCount(2);
    await faq.locator('summary').first().focus();
    await page.keyboard.press('Enter');
    await expect(faq.locator('details').first()).toHaveAttribute('open','');
    await page.waitForTimeout(700);
    await page.screenshot({path:`reports/phase-two/${name}-faq-1440.png`});
    await page.setViewportSize({width:390,height:844});
    await page.goto(origin+'/services');
    await page.locator('.service-grid').scrollIntoViewIfNeeded();
    const bar=page.locator('.mobile-contact-bar');
    await expect(bar).toHaveAttribute('aria-hidden','false');
    await expect(bar).toHaveCSS('opacity','1');
    await page.screenshot({path:`reports/phase-two/${name}-bar-390.png`});
    await page.getByRole('button',{name:'Open navigation menu'}).click();
    await expect(bar).toHaveAttribute('aria-hidden','true');
    await page.keyboard.press('Escape');
    await expect(bar).toHaveAttribute('aria-hidden','false');
    await bar.getByRole('link',{name:'Request Service'}).click();
    await expect(page.locator('#booking-wizard')).toBeFocused();
    await expect(bar).toHaveAttribute('aria-hidden','true');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(origin+'/about');
    await expect(page.locator('.route-surface')).toHaveCSS('animation-name','none');
    await page.locator('.craftsmanship').scrollIntoViewIfNeeded();
    await page.screenshot({path:`reports/phase-two/${name}-craft-390.png`});
    record.interactions = 'passed';
  } catch(error) { record.issues.push({interaction:error.message}); }
  results.push(record);
  console.log(JSON.stringify(record));
  await browser.close();
}
writeFileSync(`reports/phase-two/${process.env.INTERACTIONS_ONLY ? 'interactions' : 'browser-check'}.json`,JSON.stringify(results,null,2));
if(results.some(result=>result.issues?.length||result.errors?.length)) process.exitCode=1;
