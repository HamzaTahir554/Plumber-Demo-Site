import { test, expect } from '@playwright/test';
import {services} from '../src/data/serviceCatalog.js';
test('ten service routes and aliases fit responsive layouts and preselect booking',async({page})=>{
 test.setTimeout(120000);
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  for(const service of services){
   await page.goto('/services/'+service.slug);
   await expect(page.locator('main h1')).toHaveText(service.title);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
   expect(await page.locator('.hero-banner-image').evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
  }
 }
 for(const slug of ['pipe-repair','toilet-fixture-repair']) {await page.goto('/services/'+slug);await expect(page.locator('main')).not.toContainText('Service page not found');}
 await page.goto('/services');await expect(page.locator('.service-card')).toHaveCount(10);
 for(const service of services){await page.goto('/contact?service='+service.slug);await expect(page.locator('#booking-service')).toHaveValue(service.slug);}
});
