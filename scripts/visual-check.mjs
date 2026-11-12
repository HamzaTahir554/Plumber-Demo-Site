import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const chrome = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch(existsSync(chrome) ? { executablePath: chrome } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const origin = process.env.SITE_ORIGIN || 'http://127.0.0.1:4173';
const routes = ['/', '/services', '/services/leak-repair', '/services/drain-cleaning', '/services/water-heaters', '/services/toilet-fixture-repair', '/services/pipe-repair', '/services/sump-pumps', '/problem-finder', '/service-area', '/projects', '/maintenance', '/residential', '/commercial', '/emergency', '/about', '/contact', '/reviews', '/accessibility', '/privacy'];
const widths = [320, 360, 375, 390, 430, 768, 1024, 1440, 1920];
const folder = join('reports', 'visual');
mkdirSync(folder, { recursive: true });
const problems = [];

for (const route of routes) {
  const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    const layout = await page.evaluate(() => {
      const h1 = document.querySelector('main h1')?.getBoundingClientRect();
      const hero = document.querySelector('main .home-hero, main .hero-banner');
      const heroImage = hero?.querySelector(':scope > img');
      const heroBounds = hero?.getBoundingClientRect();
      const imageBounds = heroImage?.getBoundingClientRect();
      const heading = hero?.querySelector('h1');
      const headingBounds = heading?.getBoundingClientRect();
      const buttons = [...(hero?.querySelectorAll('.hero-actions a, .hero-actions button') || [])];
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        headingClipped: Boolean(h1 && (h1.left < -1 || h1.right > innerWidth + 1)),
        brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
        heroMissing: !hero || !heroImage,
        heroImageDoesNotCover: Boolean(hero && heroImage && (getComputedStyle(heroImage).objectFit !== 'cover' || Math.abs(heroBounds.width - imageBounds.width) > 1 || imageBounds.top > heroBounds.top + 1 || imageBounds.bottom < heroBounds.bottom - 1)),
        heroHeadingOutside: Boolean(hero && heading && (headingBounds.left < heroBounds.left - 1 || headingBounds.right > heroBounds.right + 1 || headingBounds.top < heroBounds.top - 1 || headingBounds.bottom > heroBounds.bottom + 1)),
        heroButtonOutside: Boolean(hero && buttons.some(button => { const bounds = button.getBoundingClientRect(); return bounds.left < heroBounds.left - 1 || bounds.right > heroBounds.right + 1 || bounds.top < heroBounds.top - 1 || bounds.bottom > heroBounds.bottom + 1; })),
        heroOverlayMissing: Boolean(hero && !getComputedStyle(hero, '::before').backgroundImage.includes('gradient')),
        heroHeadingWrongColor: Boolean(heading && getComputedStyle(heading).color !== (hero.classList.contains('page-hero--commercial') ? 'rgb(7, 87, 200)' : 'rgb(255, 255, 255)')),
        heroDescriptionWrongColor: Boolean(hero && getComputedStyle(hero.querySelector('.lead')).color !== (hero.classList.contains('page-hero--commercial') ? 'rgb(11, 31, 68)' : 'rgb(241, 247, 253)'))
      };
    });
    if (layout.overflow > 1 || layout.headingClipped || layout.brokenImages.length || layout.heroMissing || layout.heroImageDoesNotCover || layout.heroHeadingOutside || layout.heroButtonOutside || layout.heroOverlayMissing || layout.heroHeadingWrongColor || layout.heroDescriptionWrongColor) problems.push({ route, width, ...layout });
    if (width === 375 || width === 390 || width === 1440) {
      await page.screenshot({ path: join(folder, `${slug}-${width}-viewport.png`) });
      if ((width === 390 || width === 1440) && ['/', '/contact', '/problem-finder', '/projects', '/maintenance'].includes(route)) {
        for (const image of await page.locator('main img[loading="lazy"]').all()) {
          if (!(await image.isVisible())) continue;
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(element => element.decode().catch(() => {}));
        }
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: join(folder, `${slug}-${width}.png`), fullPage: true });
      }
    }
  }
}
writeFileSync(join(folder, 'layout-report.json'), JSON.stringify({ routes: routes.length, widths, problems }, null, 2));
await browser.close();
console.log(JSON.stringify({ checked: routes.length * widths.length, screenshots: routes.length * 3 + 10, problems }, null, 2));
