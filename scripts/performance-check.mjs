import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const chrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const origin = process.env.SITE_ORIGIN || 'http://127.0.0.1:4174';
const browser = await chromium.launch(existsSync(chrome) ? { executablePath: chrome } : {});
const results = [];

for (const route of ['/', '/services', '/problem-finder', '/service-area', '/projects', '/maintenance', '/commercial', '/about', '/contact']) {
for (const width of [375, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => {
    window.__localVitals = { lcp: 0, cls: 0, shifts: [], eventDurations: [] };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.__localVitals.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
        window.__localVitals.cls += entry.value;
        window.__localVitals.shifts.push({ atMs: Math.round(entry.startTime), value: Number(entry.value.toFixed(4)), elements: entry.sources?.map(source => source.node?.className || source.node?.tagName || 'unknown') });
      }
    }).observe({ type: 'layout-shift', buffered: true });
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (entry.interactionId) window.__localVitals.eventDurations.push(entry.duration);
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch { /* Event Timing may be unavailable in another browser. */ }
  });
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Open demo chat' }).click();
  await page.getByRole('button', { name: 'Close chat' }).click();
  await page.waitForTimeout(100);
  const metrics = await page.evaluate(() => ({
    lcpMs: Math.round(window.__localVitals.lcp),
    cls: Number(window.__localVitals.cls.toFixed(4)),
    shifts: window.__localVitals.shifts,
    observedInteractionDurationsMs: window.__localVitals.eventDurations,
    navigationMs: Math.round(performance.getEntriesByType('navigation')[0]?.duration || 0)
  }));
  results.push({ route, width, ...metrics });
  await page.close();
}
}

await browser.close();
mkdirSync('reports', { recursive: true });
writeFileSync(join('reports', 'local-performance.json'), JSON.stringify({ origin, note: 'Local production preview in Chrome; not a field Core Web Vitals result.', results }, null, 2));
console.log(JSON.stringify(results, null, 2));
