import {chromium,firefox,webkit,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4174';
mkdirSync('reports/project-stories',{recursive:true});
const results=[];
for(const [name,engine,options] of [['Chrome',chromium,{channel:'chrome'}],['Edge',chromium,{channel:'msedge'}],['Firefox',firefox,{}],['WebKit',webkit,{}]]) {
  let browser;try{browser=await engine.launch(options);}catch(error){results.push({name,unavailable:error.message});continue;}
  const report={name,version:browser.version(),checks:0,issues:[],errors:[],cls:[]};
  const page=await browser.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.addInitScript(()=>{
    window.sampleCLS=0;
    if(PerformanceObserver.supportedEntryTypes.includes('layout-shift'))new PerformanceObserver(list=>list.getEntries().forEach(entry=>{if(!entry.hadRecentInput)window.sampleCLS+=entry.value;})).observe({type:'layout-shift',buffered:true});
  });
  try {
    for(const width of [320,390,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:900});
      for(const route of ['/','/contact','/projects']) {
        await page.goto(origin+route,{waitUntil:'networkidle'});
        await expect(page.locator('main h1')).toBeVisible();
        if(route==='/') {
          await expect(page.locator('.faq-system,.work-gallery')).toHaveCount(0);
          await expect(page.locator('.story-card')).toHaveCount(3);
          for(const img of await page.locator('.story-card img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}
          await page.locator('.project-stories').evaluate(el=>scrollTo({top:el.offsetTop-110,behavior:'instant'}));
          await page.waitForTimeout(1000);
          if(width===390||width===1440)await page.screenshot({path:`reports/project-stories/${name}-stories-${width}.png`});
          const first=page.locator('.story-open').first();await first.click();
          await expect(page.getByRole('dialog')).toBeVisible();
          await page.getByRole('button',{name:'Next project story'}).click();
          await expect(page.locator('.story-dialog h2')).toHaveText('Water heater equipment');
          await page.getByRole('heading',{name:'The Result',exact:true}).scrollIntoViewIfNeeded();
          await page.waitForTimeout(350); // Capture the settled story-panel fade.
          if(width===390||width===1440)await page.screenshot({path:`reports/project-stories/${name}-dialog-${width}.png`});
          await page.keyboard.press('Escape');await expect(first).toBeFocused();
        }
        if(route==='/contact') {
          const faq=page.locator('#faq');await expect(faq).toBeAttached();
          await faq.getByRole('searchbox').fill('heater');await expect(faq.locator('details')).toHaveCount(2);
          await faq.locator('summary').first().focus();await page.keyboard.press('Enter');await expect(faq.locator('details').first()).toHaveAttribute('open','');
          if(width===390||width===1440){await faq.evaluate(el=>scrollTo({top:el.offsetTop-110,behavior:'instant'}));await page.waitForTimeout(500);await page.screenshot({path:`reports/project-stories/${name}-faq-${width}.png`});}
        }
        const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src),cls:PerformanceObserver.supportedEntryTypes.includes('layout-shift')?window.sampleCLS:null}));
        if(layout.overflow>1||layout.broken.length||layout.cls>.1)report.issues.push({route,width,...layout});
        report.cls.push({route,width,value:layout.cls});report.checks++;
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin);
    await page.locator('.story-open').first().click();await expect(page.locator('.story-dialog')).toHaveCSS('animation-name','none');
  }catch(error){report.issues.push({interaction:error.message});}
  results.push(report);await browser.close();console.log(JSON.stringify({name,checks:report.checks,issues:report.issues,errors:report.errors,maxCLS:Math.max(...report.cls.map(x=>x.value||0))}));
}
writeFileSync('reports/project-stories/browser-check.json',JSON.stringify(results,null,2));
if(results.some(item=>item.issues?.length||item.errors?.length))process.exitCode=1;
