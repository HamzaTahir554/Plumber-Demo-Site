import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { openStore, passwordHash } from '../store.mjs';
import { createApp } from '../app.mjs';

const origin = 'http://localhost:5173';
async function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'plumbing-tracking-'));
  const secret = randomBytes(32).toString('hex');
  const path = join(directory, 'test.sqlite');
  const store = openStore(path, secret), mailbox = [];
  let clock = Date.now();
  const password = 'Test-only-password-34872!';
  const staffHash = await passwordHash(password);
  for (const role of ['staff', 'admin']) store.db.prepare('INSERT INTO staff(id,username,password_hash,role) VALUES(?,?,?,?)').run(role, role, staffHash, role);
  const server = await createApp({ store, origins: [origin], deliver: async message => mailbox.push(message), now: () => clock });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { await new Promise(resolve => server.close(resolve)); store.db.close(); rmSync(directory, { recursive: true, force: true }); });
  const api = async (path, { method = 'GET', data, cookie, key, from = origin } = {}) => {
    const response = await fetch(base + '/api' + path, { method, headers: { Origin: from, 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }), ...(key && { 'Idempotency-Key': key }) }, body: data ? JSON.stringify(data) : undefined });
    return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0], headers: response.headers };
  };
  const values = { service: 'leak-repair', issue: 'Fictional kitchen pipe test', zip: '90210', address: '100 Test Street', date: new Date(clock + 86400000).toISOString().slice(0, 10), time: 'morning', name: 'Test Customer', phone: '2025550100', email: 'tester@example.test' };
  const submit = (changes = {}, key = randomBytes(24).toString('hex')) => api('/requests', { method: 'POST', key, data: { ...values, ...changes } });
  const login = async (role = 'staff') => (await api('/staff/login', { method: 'POST', data: { username: role, password } })).cookie;
  const verify = async reference => {
    const challenge = await api('/verification/start', { method: 'POST', data: { reference, email: values.email } });
    const response = await api('/verification/complete', { method: 'POST', data: { challenge: challenge.data.challenge, code: mailbox.at(-1).code } });
    assert.equal(response.status, 200); return response.cookie;
  };
  return { store, mailbox, secret, path, api, submit, login, verify, values, advance: milliseconds => { clock += milliseconds; } };
}

test('server-generated references persist, private fields are encrypted, and retries are atomic', async t => {
  const f = await fixture(t), key = randomBytes(24).toString('hex');
  const results = await Promise.all([f.submit({}, key), f.submit({}, key)]);
  assert.equal(results[0].status, 201); assert.match(results[0].data.reference, /^PS-[A-F0-9]{16}$/);
  assert.equal(results[0].data.reference, results[1].data.reference);
  assert.equal(f.store.db.prepare('SELECT count(*) AS count FROM requests').get().count, 1);
  assert.equal(f.store.db.prepare('SELECT count(*) AS count FROM events').get().count, 1);
  assert.equal((await f.submit({ name: 'Different Customer' }, key)).status, 409);
  const row = f.store.db.prepare('SELECT * FROM requests').get();
  assert.ok(!row.private_data.includes(f.values.email)); assert.equal(f.store.unseal(row.private_data).address, f.values.address);
  const reopened = openStore(f.path, f.secret);
  assert.equal(reopened.db.prepare('SELECT reference FROM requests').get().reference, results[0].data.reference); reopened.db.close();
  assert.ok(!JSON.stringify(results[0].data).includes(f.values.email));
});

test('a reference alone cannot access data; email matching responses do not enumerate records', async t => {
  const f = await fixture(t), saved = await f.submit();
  assert.equal((await f.api('/tracking?reference=' + saved.data.reference)).status, 401);
  const valid = await f.api('/verification/start', { method: 'POST', data: { reference: saved.data.reference, email: f.values.email } });
  const missing = await f.api('/verification/start', { method: 'POST', data: { reference: 'PS-0000000000000000', email: f.values.email } });
  const wrongEmail = await f.api('/verification/start', { method: 'POST', data: { reference: saved.data.reference, email: 'different@example.test' } });
  assert.equal(valid.data.message, missing.data.message); assert.equal(missing.data.message, wrongEmail.data.message);
  assert.equal(valid.status, missing.status); assert.equal(valid.data.challenge.length, missing.data.challenge.length); assert.equal(f.mailbox.length, 1);
  assert.equal((await f.api('/verification/complete', { method: 'POST', data: { challenge: missing.data.challenge, code: f.mailbox[0].code } })).status, 400);
});

test('verification is single-use, expires, limits wrong attempts, and stores only keyed hashes', async t => {
  const f = await fixture(t), saved = await f.submit();
  const start = () => f.api('/verification/start', { method: 'POST', data: { reference: saved.data.reference, email: f.values.email } });
  let challenge = (await start()).data.challenge, code = f.mailbox.at(-1).code;
  const complete = () => f.api('/verification/complete', { method: 'POST', data: { challenge, code } });
  assert.notEqual(f.store.db.prepare('SELECT code_hash FROM challenges WHERE id=?').get(challenge).code_hash, code);
  assert.equal((await complete()).status, 200); assert.equal((await complete()).status, 400);
  challenge = (await start()).data.challenge; code = f.mailbox.at(-1).code;
  f.advance(600001); assert.equal((await complete()).status, 400);
  challenge = (await start()).data.challenge; const correct = f.mailbox.at(-1).code; code = '00000000';
  for (let i = 0; i < 5; i++) assert.equal((await complete()).status, 400);
  code = correct; assert.equal((await complete()).status, 400);
});

test('customer cookies are scoped to one request, expire, and cannot access staff tools', async t => {
  const f = await fixture(t), first = await f.submit(), second = await f.submit({ name: 'Second Person' });
  const cookie = await f.verify(first.data.reference);
  const response = await f.api('/tracking?reference=' + second.data.reference, { cookie });
  assert.equal(response.data.reference, first.data.reference); assert.equal(response.data.customer, undefined); assert.equal(response.data.notes, undefined); assert.equal(response.data.events[0].actor, undefined);
  assert.equal((await f.api('/staff/requests', { cookie })).status, 401);
  assert.equal((await f.api('/staff/requests/' + first.data.reference, { method: 'PATCH', cookie, data: { status: 'completed', version: 1 } })).status, 401);
  f.advance(1800001); assert.equal((await f.api('/tracking', { cookie })).status, 401);
});

test('staff saves real nonlinear history, reschedules, private notes, and handles concurrent edits', async t => {
  const f = await fixture(t), saved = await f.submit(), cookie = await f.login(), customer = await f.verify(saved.data.reference);
  const path = '/staff/requests/' + saved.data.reference;
  const update = data => f.api(path, { method: 'PATCH', cookie, data });
  let result = await update({ status: 'under_review', version: 1, note: 'Internal test note', message: 'Reviewing the requested work.' });
  assert.equal(result.status, 200); assert.equal(result.data.version, 2);
  assert.equal((await update({ status: 'scheduled', version: 1, appointment: '2027-01-05T14:00:00Z' })).status, 409);
  assert.equal((await update({ status: 'scheduled', version: 2 })).status, 400);
  result = await update({ status: 'scheduled', version: 2, appointment: '2027-01-05T14:00:00Z' }); assert.equal(result.status, 200);
  result = await update({ status: 'scheduled', version: 3, appointment: '2027-01-06T15:00:00Z', message: 'Rescheduled.' }); assert.equal(result.status, 200);
  let visible = await f.api('/tracking', { cookie: customer });
  assert.equal(visible.data.events.length, 4); assert.equal(visible.data.events[2].appointment, '2027-01-05T14:00:00Z'); assert.equal(visible.data.appointment, '2027-01-06T15:00:00Z');
  assert.ok(!JSON.stringify(visible.data).includes('Internal test note'));
  assert.equal((await update({ status: 'completed', version: 4 })).status, 400);
  assert.equal((await update({ status: 'cancelled', version: 4, message: 'Cancelled by staff.' })).status, 200);
  assert.equal((await update({ status: 'under_review', version: 5, reason: 'Correcting a mistaken cancellation.' })).status, 400);
  const admin = await f.login('admin');
  assert.equal((await f.api(path, { method: 'PATCH', cookie: admin, data: { status: 'under_review', version: 5, reason: 'Correcting a mistaken cancellation.' } })).status, 200);
  visible = await f.api('/tracking', { cookie: customer }); assert.equal(visible.data.events.length, 6);
  assert.ok(f.store.db.prepare("SELECT count(*) AS count FROM audit WHERE action='request-updated'").get().count >= 5);
});

test('authorization is rechecked after staff deactivation and logout revokes server sessions', async t => {
  const f = await fixture(t), cookie = await f.login();
  assert.equal((await f.api('/staff/requests', { cookie })).status, 200);
  await f.api('/staff/logout', { cookie, method: 'POST', data: {} });
  assert.equal((await f.api('/staff/requests', { cookie })).status, 401);
  const next = await f.login(); f.store.db.prepare("UPDATE staff SET active=0 WHERE id='staff'").run();
  assert.equal((await f.api('/staff/requests', { cookie: next })).status, 401);
});

test('input validation, exact reference search, origin protection, and rate limits are enforced', async t => {
  const f = await fixture(t);
  assert.equal((await f.submit({ service: 'not-real' })).status, 400);
  assert.equal((await f.submit({ date: '2027-02-30' })).status, 400);
  assert.equal((await f.api('/requests', { method: 'POST', data: f.values, key: randomBytes(24).toString('hex'), from: 'https://attacker.test' })).status, 403);
  const saved = await f.submit(), cookie = await f.login();
  const list = await f.api('/staff/requests?reference=' + saved.data.reference, { cookie }); assert.equal(list.data.requests.length, 1);
  assert.equal((await f.api('/staff/requests?status=unknown', { cookie })).status, 400);
  for (let i = 0; i < 5; i++) assert.equal((await f.api('/verification/start', { method: 'POST', data: { reference: saved.data.reference, email: f.values.email } })).status, 200);
  const limited = await f.api('/verification/start', { method: 'POST', data: { reference: saved.data.reference, email: f.values.email } });
  assert.equal(limited.status, 429); assert.ok(limited.headers.get('retry-after'));
});

test('unchanged or conflicting staff writes do not duplicate events', async t => {
  const f = await fixture(t), saved = await f.submit(), cookie = await f.login();
  const path = '/staff/requests/' + saved.data.reference;
  assert.equal((await f.api(path, { method: 'PATCH', cookie, data: { status: 'submitted', version: 1 } })).status, 400);
  const results = await Promise.all([1, 2].map(() => f.api(path, { method: 'PATCH', cookie, data: { status: 'under_review', version: 1 } })));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal(f.store.db.prepare('SELECT count(*) AS count FROM events').get().count, 2);
});

test('all ten catalog IDs persist and legacy IDs map without deleting history', async t => {
  const { services } = await import('../../src/data/serviceCatalog.js');
  const f = await fixture(t);
  for (const service of services) {
    const response = await f.submit({ service: service.slug });
    assert.equal(response.status, 201);
  }
  const legacy = await f.submit({ service: 'toilet-fixture-repair' });
  assert.equal(legacy.status, 201);
  const cookie = await f.login();
  const filtered = await f.api('/staff/requests?service=fixture-repair', { cookie });
  assert.equal(filtered.data.requests.length, 2);
  assert.equal(f.store.db.prepare('SELECT count(*) AS count FROM requests').get().count, 11);
});
