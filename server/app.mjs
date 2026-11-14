import { createServer } from 'node:http';
import { randomBytes, randomInt } from 'node:crypto';
import { token, passwordHash, passwordMatches } from './store.mjs';
import { statuses, canTransition } from './lifecycle.mjs';

const services = ['leak-repair', 'drain-cleaning', 'water-heaters', 'toilet-fixture-repair', 'pipe-repair', 'sump-pumps', 'other'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const referencePattern = /^PS-[A-F0-9]{16}$/;
const generic = 'If these details match a request, a verification code is available in the local test inbox. It expires in 10 minutes.';
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new HttpError(status, message); };
function str(value, max, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim()) || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(value)) fail(400, 'Check the required fields and their lengths.');
  return value.trim();
}
function booking(input, now) {
  const value = {};
  for (const [key, max] of Object.entries({ service: 40, issue: 500, zip: 10, address: 160, date: 10, time: 15, name: 100, phone: 30, email: 150 })) value[key] = str(input[key] ?? '', max, key !== 'issue');
  value.email = value.email.toLowerCase();
  if (!services.includes(value.service) || !/^[0-9]{5}(?:-[0-9]{4})?$/.test(value.zip) || !emailPattern.test(value.email) || value.name.length < 2 || value.phone.replace(/\D/g, '').length < 10 || !['morning', 'afternoon', 'evening'].includes(value.time)) fail(400, 'Check the service, contact, location, and preferred time fields.');
  const date = Date.parse(`${value.date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || !Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== value.date || date < now - 86400000 || date > now + 366 * 86400000) fail(400, 'Choose a valid preferred date within the next year.');
  return value;
}
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Send JSON data.');
  let data = '', length = 0;
  for await (const chunk of req) { length += chunk.length; if (length > 16384) fail(413, 'Request is too large.'); data += chunk; }
  try { const value = JSON.parse(data); if (!value || Array.isArray(value) || typeof value !== 'object') throw Error(); return value; }
  catch { fail(400, 'Invalid request data.'); }
}

export async function createApp({ store, origins, deliver, now = Date.now }) {
  const { db, hash, seal, unseal, transaction } = store;
  // A nonexistent account must do the same password work as a valid one.
  const dummyPassword = await passwordHash(token());
  const iso = () => new Date(now()).toISOString();
  const one = (sql, ...params) => db.prepare(sql).get(...params);
  const run = (sql, ...params) => db.prepare(sql).run(...params);
  const all = (sql, ...params) => db.prepare(sql).all(...params);
  function limit(scope, identity, max, milliseconds) {
    const key = hash(`${scope}:${identity}`);
    const row = one(`INSERT INTO limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET
      hits=CASE WHEN expires_at<=? THEN 1 ELSE hits+1 END,
      expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING hits`, key, now() + milliseconds, now(), now());
    if (row.hits > max) fail(429, 'Too many attempts. Please wait before trying again.');
  }
  function session(req, kind) {
    const name = kind === 'staff' ? 'ps_staff' : 'ps_customer';
    const value = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
    const row = one('SELECT * FROM sessions WHERE hash=? AND kind=? AND expires_at>?', hash(value), kind, now());
    if (!row) fail(401, kind === 'staff' ? 'Sign in to continue.' : 'Verify your request again. Your session may have expired.');
    if (kind === 'staff') {
      const actor = one('SELECT id,username,role FROM staff WHERE id=? AND active=1', row.subject);
      if (!actor) fail(401, 'Sign in to continue.');
      return { ...row, actor };
    }
    return row;
  }
  function startSession(res, kind, subject, req) {
    // Replace this browser's previous session; keep different staff/customer browsers independent.
    try { const previous = session(req, kind); run('DELETE FROM sessions WHERE hash=?', previous.hash); } catch { /* no previous session */ }
    const value = token(), seconds = kind === 'staff' ? 3600 : 1800;
    run('INSERT INTO sessions(hash,kind,subject,expires_at) VALUES(?,?,?,?)', hash(value), kind, subject, now() + seconds * 1000);
    res.setHeader('Set-Cookie', `ps_${kind}=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${seconds}`);
  }
  function snapshot(row, staff = false) {
    const events = all('SELECT id,previous_status,status,created_at,message,appointment FROM events WHERE request_id=? ORDER BY id', row.id);
    const result = { reference: row.reference, service: row.service, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, preferredDate: row.preferred_date, preferredTime: row.preferred_time, appointment: row.appointment, version: row.version, events };
    if (staff) {
      result.customer = unseal(row.private_data);
      result.notes = all('SELECT body,actor,created_at FROM notes WHERE request_id=? ORDER BY id', row.id).map(note => ({ ...note, body: unseal(note.body) }));
      result.events = all('SELECT * FROM events WHERE request_id=? ORDER BY id', row.id);
    }
    return result;
  }
  function event(row, status, actor, message, appointment) {
    run('INSERT INTO events(request_id,previous_status,status,created_at,actor,message,appointment) VALUES(?,?,?,?,?,?,?)', row.id, row.status || null, status, iso(), actor, message, appointment);
  }
  function audit(actor, action, requestId = null) { run('INSERT INTO audit(actor,action,request_id,created_at) VALUES(?,?,?,?)', actor, action, requestId, iso()); }

  const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    const reply = (data, status = 200) => { res.statusCode = status; res.end(JSON.stringify(data)); };
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname, method = req.method;
      const ip = req.socket.remoteAddress || 'unknown'; // Never trust public forwarding headers.
      limit('network', ip, 600, 60000);
      if (method !== 'GET' && (!origins.includes(req.headers.origin) || req.headers['sec-fetch-site'] === 'cross-site')) fail(403, 'This action must originate from the configured website.');
      if (path === '/api/config' && method === 'GET') return reply({ enabled: true, mode: 'local-demo', email: 'local-test-inbox' });
      if (path === '/api/requests' && method === 'POST') {
        limit('submit', ip, 12, 3600000);
        const input = await body(req), value = booking(input, now());
        const key = req.headers['idempotency-key'];
        if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{22,80}$/.test(key)) fail(400, 'A valid retry key is required.');
        const keyHash = hash(`retry:${key}`), payloadHash = hash(JSON.stringify(value));
        const result = transaction(() => {
          const existing = one('SELECT * FROM requests WHERE idempotency_hash=?', keyHash);
          if (existing) { if (existing.payload_hash !== payloadHash) fail(409, 'This retry key belongs to different details. Start a new request.'); return { reference: existing.reference, createdAt: existing.created_at }; }
          const id = token(), reference = `PS-${randomBytes(8).toString('hex').toUpperCase()}`, timestamp = iso();
          run('INSERT INTO requests(id,reference,email_hash,private_data,service,preferred_date,preferred_time,created_at,updated_at,idempotency_hash,payload_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?)', id, reference, hash(value.email), seal(value), value.service, value.date, value.time, timestamp, timestamp, keyHash, payloadHash);
          event({ id, status: null }, 'submitted', 'customer-submission', 'Your request was received. Your preferred visit is not a confirmed appointment.', null);
          audit('customer-submission', 'request-created', id);
          return { reference, createdAt: timestamp };
        });
        return reply({ ...result, mode: 'local-demo', notification: 'not-sent' }, 201);
      }
      if (path === '/api/verification/start' && method === 'POST') {
        limit('verification-start', ip, 20, 3600000);
        const input = await body(req), reference = str(input.reference, 40).toUpperCase(), email = str(input.email, 150).toLowerCase();
        limit('verification-target', `${reference}:${email}`, 5, 900000);
        const row = one('SELECT id FROM requests WHERE reference=? AND email_hash=?', reference, hash(email));
        const id = token(), code = String(randomInt(10000000, 100000000));
        // Identical public response and challenge for matched and unmatched references.
        run('INSERT INTO challenges(id,request_id,code_hash,expires_at) VALUES(?,?,?,?)', id, row?.id || null, hash(`${id}:${code}`), now() + 600000);
        if (row) {
          // Local-only mailbox; no public endpoint can retrieve codes. No real mail is sent.
          await deliver({ to: email, reference, code, expiresAt: new Date(now() + 600000).toISOString() });
        }
        return reply({ challenge: id, message: generic });
      }
      if (path === '/api/verification/complete' && method === 'POST') {
        limit('verification-complete', ip, 30, 900000);
        const input = await body(req), id = str(input.challenge, 64), code = str(input.code, 8);
        const subject = transaction(() => {
          const row = one('SELECT * FROM challenges WHERE id=?', id);
          if (!row || row.used || row.expires_at <= now() || row.attempts >= 5) return null;
          run('UPDATE challenges SET attempts=attempts+1 WHERE id=?', id);
          if (row.code_hash !== hash(`${id}:${code}`) || !row.request_id) return null;
          run('UPDATE challenges SET used=1 WHERE id=?', id);
          return row.request_id;
        });
        if (!subject) fail(400, 'Unable to verify. Check the code or request a new one.');
        startSession(res, 'customer', subject, req);
        return reply({ verified: true });
      }
      if (path === '/api/tracking' && method === 'GET') {
        const auth = session(req, 'customer');
        const row = one('SELECT * FROM requests WHERE id=?', auth.subject);
        if (!row) fail(401, 'Verify your request again.');
        return reply(snapshot(row));
      }
      if (path === '/api/staff/login' && method === 'POST') {
        limit('staff-login-ip', ip, 15, 900000);
        const input = await body(req), username = str(input.username, 80), password = str(input.password, 200);
        limit('staff-login-user', username, 10, 900000);
        const actor = one('SELECT * FROM staff WHERE username=?', username);
        const valid = await passwordMatches(password, actor?.password_hash || dummyPassword);
        if (!valid || !actor?.active) { audit('unauthenticated', 'staff-login-failed'); fail(401, 'Unable to sign in with those details.'); }
        startSession(res, 'staff', actor.id, req); audit(actor.id, 'staff-login');
        return reply({ username: actor.username, role: actor.role });
      }
      if (path === '/api/staff/session' && method === 'GET') {
        const { actor } = session(req, 'staff'); return reply({ username: actor.username, role: actor.role });
      }
      if (['/api/staff/logout', '/api/tracking/logout'].includes(path) && method === 'POST') {
        const kind = path.includes('/staff/') ? 'staff' : 'customer';
        try { const auth = session(req, kind); run('DELETE FROM sessions WHERE hash=?', auth.hash); } catch { /* Idempotent logout. */ }
        res.setHeader('Set-Cookie', `ps_${kind}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0`);
        return reply({ signedOut: true });
      }
      if (path === '/api/staff/requests' && method === 'GET') {
        const { actor } = session(req, 'staff');
        const status = url.searchParams.get('status') || '', reference = (url.searchParams.get('reference') || '').toUpperCase();
        const offset = Math.max(0, Math.min(100000, Number(url.searchParams.get('offset')) || 0));
        if ((status && !statuses.includes(status)) || reference.length > 40) fail(400, 'Invalid filter.');
        const rows = all('SELECT reference,service,status,created_at,updated_at FROM requests WHERE (?=\'\' OR status=?) AND (?=\'\' OR reference=?) ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?', status, status, reference, reference, offset);
        audit(actor.id, 'request-list-viewed');
        return reply({ requests: rows.slice(0, 50), hasMore: rows.length > 50 });
      }
      if (path.startsWith('/api/staff/requests/') && ['GET', 'PATCH'].includes(method)) {
        const { actor } = session(req, 'staff'), reference = path.split('/').at(-1);
        if (!referencePattern.test(reference)) fail(404, 'Request not found.');
        const row = one('SELECT * FROM requests WHERE reference=?', reference);
        if (!row) fail(404, 'Request not found.');
        if (method === 'GET') { audit(actor.id, 'request-viewed', row.id); return reply(snapshot(row, true)); }
        const input = await body(req), status = str(input.status, 30), message = str(input.message || '', 500, false), note = str(input.note || '', 2000, false), reason = str(input.reason || '', 500, false);
        const appointment = input.appointment ? str(input.appointment, 35) : null;
        if (appointment && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(appointment) || !Number.isFinite(Date.parse(appointment)))) fail(400, 'Use a valid appointment timestamp with a timezone.');
        if (status === 'scheduled' && !appointment) fail(400, 'A scheduled appointment requires a confirmed date and time.');
        if (!canTransition(row.status, status, actor.role, reason)) fail(400, 'This status transition is not allowed. Closed requests require an administrator and a correction reason.');
        transaction(() => {
          const latest = one('SELECT * FROM requests WHERE id=?', row.id);
          if (latest.version !== input.version) fail(409, 'Another update was saved. Reload the request before making changes.');
          if (latest.status === status && latest.appointment === appointment && !message && !note && !reason) fail(400, 'There are no changes to save.');
          run('UPDATE requests SET status=?,appointment=?,updated_at=?,version=version+1 WHERE id=?', status, appointment, iso(), row.id);
          if (latest.status !== status || latest.appointment !== appointment || message) event(latest, status, actor.id, message, appointment);
          if (note || reason) run('INSERT INTO notes(request_id,body,actor,created_at) VALUES(?,?,?,?)', row.id, seal([reason && `Correction reason: ${reason}`, note].filter(Boolean).join('\n')), actor.id, iso());
          audit(actor.id, 'request-updated', row.id);
        });
        return reply(snapshot(one('SELECT * FROM requests WHERE id=?', row.id), true));
      }
      fail(404, 'Endpoint not found.');
    } catch (error) {
      if (error.status === 429) res.setHeader('Retry-After', '900');
      if (!res.headersSent) reply({ error: error instanceof HttpError ? error.message : 'The request could not be completed. Please retry shortly.' }, error.status || 503);
      else res.end();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  const cleanup = setInterval(() => {
    run('DELETE FROM sessions WHERE expires_at<=?', now());
    run('DELETE FROM challenges WHERE expires_at<=?', now());
    run('DELETE FROM limits WHERE expires_at<=?', now());
  }, 60000);
  cleanup.unref(); server.on('close', () => clearInterval(cleanup));
  return server;
}
