import { chromium, firefox, webkit, expect } from '@playwright/test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { openStore, passwordHash } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';

const directory = mkdtempSync(join(tmpdir(), 'plumbing-browser-'));
const store = openStore(join(directory, 'test.sqlite'), randomBytes(32).toString('hex'));
const password = randomBytes(24).toString('hex'), mailbox = [], reports = [];
store.db.prepare('INSERT INTO staff(id,username,password_hash,role) VALUES(?,?,?,?)').run('browser-admin', 'test-admin', await passwordHash(password), 'admin');
const origin = 'http://127.0.0.1:4177';
const server = await createApp({ store, origins: [origin], deliver: async value => mailbox.push(value) });
let preview;
mkdirSync('reports/tracking', { recursive: true });
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(8787, '127.0.0.1', resolve); });
  preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4177', '--strictPort'], { env: { ...process.env, LOCAL_REQUEST_API: '1' }, windowsHide: true, stdio: 'pipe' });
  let previewLog = ''; preview.stderr.on('data', data => { previewLog += data; });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin + '/api/config')).ok) break; } catch { /* starting */ }
    if (preview.exitCode !== null) throw new Error(previewLog || 'Preview exited.');
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  for (const [name, engine, options] of [['Chrome', chromium, { channel: 'chrome' }], ['Edge', chromium, { channel: 'msedge' }], ['Firefox', firefox, {}], ['WebKit', webkit, {}]]) {
    let browser;
    try { browser = await engine.launch(options); } catch (error) { reports.push({ name, unavailable: error.message }); continue; }
    const report = { name, version: browser.version(), checks: 0, errors: [], issues: [], cls: [], polling: false };
    const context = await browser.newContext(); const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.addInitScript(() => {
      window.trackingCLS = null;
      if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        window.trackingCLS = 0;
        new PerformanceObserver(list => list.getEntries().forEach(entry => { if (!entry.hadRecentInput) window.trackingCLS += entry.value; })).observe({ type: 'layout-shift', buffered: true });
      }
    });
    async function layout(label, width) {
      await page.waitForTimeout(700);
      const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, cls: window.trackingCLS, broken: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src) }));
      report.checks++; report.cls.push({ label, width, value: result.cls });
      if (result.overflow > 1 || result.broken.length || result.cls > .1) report.issues.push({ label, width, ...result });
      if ([390, 1440].includes(width)) await page.screenshot({ path: `reports/tracking/${name}-${label}-${width}.png` });
    }
    try {
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 }); await page.goto(origin + '/track-request', { waitUntil: 'networkidle' });
        await expect(page.getByRole('heading', { name: 'Find your request securely' })).toBeVisible();
        await page.locator('.request-verify-layout').scrollIntoViewIfNeeded(); await layout('verify', width);
      }
      const saved = await page.evaluate(async () => {
        const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ service: 'leak-repair', issue: 'Synthetic cross-browser test request', zip: '90210', address: '100 Test Street', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: 'morning', name: 'Test Customer', phone: '2025550100', email: 'browsers@example.test' }) });
        if (!response.ok) throw new Error('Test submission failed.'); return response.json();
      });
      await page.getByLabel('Request reference', { exact: true }).fill(saved.reference); await page.getByLabel('Request email address').fill('browsers@example.test');
      await page.getByRole('button', { name: 'Get verification code' }).click(); await expect(page.getByLabel('8-digit verification code')).toBeFocused();
      await page.getByLabel('8-digit verification code').fill(mailbox.findLast(item => item.reference === saved.reference).code); await page.getByRole('button', { name: 'Track request', exact: true }).click();
      await expect(page.locator('.request-summary h2')).toHaveText('Request Received');
      for (const width of [320, 390, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 }); await page.reload({ waitUntil: 'networkidle' }); await expect(page.locator('.request-summary h2')).toHaveText('Request Received');
        await page.locator('.request-results').scrollIntoViewIfNeeded(); await layout('result', width);
      }
      await page.clock.install(); await page.getByLabel('Refresh every 30 seconds while this tab is visible').check();
      const staff = await context.newPage(); await staff.goto(origin + '/staff/requests');
      await staff.getByLabel('Username', { exact: true }).fill('test-admin'); await staff.getByLabel('Password', { exact: true }).fill(password); await staff.getByRole('button', { name: 'Sign in', exact: true }).click();
      await staff.getByRole('button', { name: new RegExp(saved.reference) }).click();
      await staff.getByLabel('Status', { exact: true }).selectOption('under_review'); await staff.getByLabel('Customer-visible update').fill('Saved by the cross-browser test.');
      await staff.getByRole('button', { name: 'Save update' }).click(); await expect(staff.getByRole('status').filter({ hasText: 'Update saved.' })).toBeVisible();
      await page.bringToFront(); await page.clock.fastForward(31000); await expect(page.locator('.request-summary h2')).toHaveText('Under Review'); report.polling = true;
      await page.getByLabel('Refresh every 30 seconds while this tab is visible').uncheck(); await page.clock.resume();
      await staff.close();
      await page.goto(origin + '/staff/requests'); await page.getByRole('button', { name: new RegExp(saved.reference) }).click();
      for (const width of [320, 390, 768, 1024, 1440, 1920]) { await page.setViewportSize({ width, height: 900 }); await page.getByRole('heading', { name: 'Update request', exact: true }).scrollIntoViewIfNeeded(); await layout('staff', width); }
      await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.locator('.request-timeline li').first()).toHaveCSS('animation-name', 'none');
      await page.goto(origin + '/track-request'); await expect(page.locator('.request-summary h2')).toHaveText('Under Review');
      await page.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Find your request securely' })).toBeVisible();
    } catch (error) { report.issues.push({ interaction: error.message }); }
    reports.push(report); console.log(JSON.stringify({ name, checks: report.checks, issues: report.issues, errors: report.errors, polling: report.polling, maxCLS: Math.max(...report.cls.map(item => item.value || 0)) }));
    await browser.close();
  }
} finally {
  preview?.kill();
  await new Promise(resolve => server.close(resolve)); store.db.close(); rmSync(directory, { recursive: true, force: true });
  writeFileSync('reports/tracking/browser-check.json', JSON.stringify(reports, null, 2));
}
if (reports.some(item => item.issues?.length || item.errors?.length)) process.exitCode = 1;
