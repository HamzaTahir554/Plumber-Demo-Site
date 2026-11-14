import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { openStore, passwordHash } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';

let server, store, directory, apiOrigin;
const mailbox = [], password = 'Browser-test-password-87402!';
test.beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'plumbing-ui-'));
  store = openStore(join(directory, 'test.sqlite'), randomBytes(32).toString('hex'));
  store.db.prepare('INSERT INTO staff(id,username,password_hash,role) VALUES(?,?,?,?)').run('browser-admin', 'test-admin', await passwordHash(password), 'admin');
  server = await createApp({ store, origins: ['http://127.0.0.1:4173'], deliver: async value => mailbox.push(value) });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); apiOrigin = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); store.db.close(); rmSync(directory, { recursive: true, force: true }); });
async function connect(page) {
  // Forward to a real isolated HTTP API and SQLite database, never fabricated responses.
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: apiOrigin + url.pathname + url.search });
    await route.fulfill({ response });
  });
}
async function submitViaApi(page) {
  const response = await page.evaluate(async () => {
    const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ service: 'leak-repair', issue: 'Fictional leak for browser testing', zip: '90210', address: '100 Test Street', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: 'morning', name: 'Test Customer', phone: '2025550100', email: 'browser@example.test' }) });
    return { status: response.status, data: await response.json() };
  });
  expect(response.status).toBe(201); return response.data.reference;
}
async function verify(page, reference, email = 'browser@example.test') {
  await page.goto('/track-request');
  await page.getByLabel('Request reference', { exact: true }).fill(reference);
  await page.getByLabel('Request email address').fill(email);
  await page.getByRole('button', { name: 'Get verification code' }).click();
  await expect(page.getByLabel('8-digit verification code')).toBeFocused();
  const code = mailbox.findLast(item => item.reference === reference).code;
  await page.getByLabel('8-digit verification code').fill(code);
  await page.getByRole('button', { name: 'Track request', exact: true }).click();
  await expect(page.locator('.request-summary h2')).toHaveText('Request Received');
}

test('booking persists a request, verifies it, staff updates it, and refresh retains actual history', async ({ page, context }) => {
  await connect(page); await page.goto('/contact?service=leak-repair#booking-wizard');
  const wizard = page.locator('#booking-wizard');
  await expect(wizard).toContainText('Local demo:');
  await expect(wizard.locator('#booking-service')).toHaveValue('leak-repair');
  await wizard.getByRole('button', { name: 'Next', exact: true }).click();
  await wizard.locator('input').first().fill('90210'); await wizard.getByLabel('Service address').fill('100 Test Street');
  await wizard.getByRole('button', { name: 'Next', exact: true }).click();
  await wizard.getByLabel('Preferred date').fill(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  await wizard.getByLabel('Preferred time').selectOption('morning'); await wizard.getByRole('button', { name: 'Next', exact: true }).click();
  await wizard.getByLabel('Full name').fill('Browser Test'); await wizard.getByLabel('Phone number').fill('2025550100'); await wizard.getByLabel('Email address').fill('booking@example.test');
  await wizard.getByRole('button', { name: 'Next', exact: true }).click();
  await wizard.getByRole('button', { name: 'Submit test request' }).click();
  await expect(wizard.getByRole('heading', { name: 'Your test service request has been received' })).toBeVisible();
  const reference = await wizard.locator('.request-reference').innerText(); expect(reference).toMatch(/^PS-/);
  expect(store.db.prepare('SELECT reference FROM requests WHERE reference=?').get(reference)).toBeTruthy();
  await wizard.getByRole('link', { name: 'Track request' }).click();
  await expect(page.getByLabel('Request reference', { exact: true })).toHaveValue(reference);
  await page.getByLabel('Request email address').fill('booking@example.test'); await page.getByRole('button', { name: 'Get verification code' }).click();
  await page.getByLabel('8-digit verification code').fill(mailbox.findLast(item => item.reference === reference).code);
  await page.getByRole('button', { name: 'Track request', exact: true }).click();
  await expect(page.locator('.request-summary h2')).toHaveText('Request Received');
  const staff = await context.newPage(); await connect(staff); await staff.goto('/staff/requests');
  await staff.getByLabel('Username', { exact: true }).fill('test-admin'); await staff.getByLabel('Password', { exact: true }).fill(password); await staff.getByRole('button', { name: 'Sign in', exact: true }).click();
  await staff.getByRole('button', { name: new RegExp(reference) }).click();
  await staff.getByLabel('Status', { exact: true }).selectOption('under_review'); await staff.getByLabel('Customer-visible update').fill('Reviewing this test request.'); await staff.getByLabel('Internal note (staff only)').fill('Private browser test note');
  await staff.getByRole('button', { name: 'Save update' }).click(); await expect(staff.getByRole('status').filter({ hasText: 'Update saved.' })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh status' }).click(); await expect(page.locator('.request-summary h2')).toHaveText('Under Review');
  await expect(page.locator('.request-timeline li')).toHaveCount(2); await expect(page.locator('.request-results')).not.toContainText('Private browser test note');
  await staff.getByLabel('Status', { exact: true }).selectOption('scheduled');
  await staff.getByLabel('Confirmed appointment', { exact: true }).fill('2027-01-05T14:30');
  await staff.getByRole('button', { name: 'Save update' }).click();
  await expect(staff.getByRole('status').filter({ hasText: 'Update saved.' })).toBeVisible();
  await expect(staff.getByLabel('Confirmed appointment', { exact: true })).toHaveValue('2027-01-05T14:30');
  expect(store.db.prepare('SELECT appointment FROM requests WHERE reference=?').get(reference).appointment).toMatch(/Z$/);
  const staffAxe = await new AxeBuilder({ page: staff }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(staffAxe.violations).toEqual([]);
  await page.reload(); await expect(page.locator('.request-summary h2')).toHaveText('Appointment Scheduled');
  await expect(page.locator('.request-timeline li')).toHaveCount(3);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Find your request securely' })).toBeVisible();
  await staff.close();
});

test('tracker handles incorrect codes and network errors without showing a fabricated result', async ({ page }) => {
  await connect(page); await page.goto('/track-request'); const reference = await submitViaApi(page);
  await page.getByLabel('Request reference', { exact: true }).fill(reference); await page.getByLabel('Request email address').fill('browser@example.test'); await page.getByRole('button', { name: 'Get verification code' }).click();
  await page.getByLabel('8-digit verification code').fill('00000000'); await page.getByRole('button', { name: 'Track request', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Unable to verify'); await expect(page.locator('.request-results')).toHaveCount(0);
  await page.route('**/api/verification/complete', route => route.abort());
  await page.getByRole('button', { name: 'Track request', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('unavailable');
});

test('tracking and staff layouts work at all six widths with accessible, reduced-motion results', async ({ page }) => {
  await connect(page); await page.goto('/track-request'); const reference = await submitViaApi(page);
  await verify(page, reference);
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 }); await page.locator('.request-results').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px overflow`).toBeLessThanOrEqual(1);
    await expect(page.locator('.mobile-contact-bar')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.getByRole('button', { name: 'Refresh status' })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.locator('.request-timeline li').first()).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  const formAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(formAxe.violations).toEqual([]);
  await page.goto('/staff/requests');
  const staffAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(staffAxe.violations).toEqual([]);
});

test('unconnected deployed demo offers honest empty states and retains tracking links and Contact FAQ', async ({ page }) => {
  await page.goto('/track-request'); await expect(page.getByRole('heading', { name: 'Tracking is not connected' })).toBeVisible();
  await expect(page.locator('.request-timeline')).toHaveCount(0);
  await page.goto('/staff/requests'); await expect(page.getByRole('heading', { name: 'Staff service is not connected' })).toBeVisible();
  await page.goto('/contact#faq'); await page.locator('#faq').getByRole('searchbox').fill('track my service request'); await expect(page.locator('#faq details')).toHaveCount(1);
  await expect(page.locator('.footer').getByRole('link', { name: 'Track request', exact: true })).toHaveAttribute('href', '/track-request');
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Track request', exact: true })).toBeVisible();
});
