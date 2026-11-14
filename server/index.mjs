import { appendFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { openStore } from './store.mjs';
import { createApp } from './app.mjs';

// Deliberately local-only per the owner's demo-only scope. Never deploy this inbox adapter.
if (process.env.NODE_ENV === 'production') throw new Error('This is a local demonstration backend, not a production email service. See TRACKING_SYSTEM.md.');
const origins = (process.env.APP_ORIGIN || '').split(',').filter(Boolean);
if (!origins.length || origins.some(value => { const url = new URL(value); return url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname) || url.origin !== value; })) throw new Error('APP_ORIGIN must list explicit local HTTP origins.');
const path = resolve(process.env.DATABASE_PATH || './data/requests.sqlite');
mkdirSync(dirname(path), { recursive: true });
const store = openStore(path, process.env.APP_SECRET || '');
const inbox = resolve(dirname(path), 'inbox.jsonl');
const server = await createApp({ store, origins, deliver: async message => {
  appendFileSync(inbox, JSON.stringify({ ...message, localDemo: true }) + '\n', { mode: 0o600 });
} });
server.listen(Number(process.env.PORT) || 8787, '127.0.0.1', () => console.log('Local request demo API listening on loopback. No real email or appointments.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { store.db.close(); process.exit(0); }));
