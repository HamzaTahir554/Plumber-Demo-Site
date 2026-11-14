import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { openStore, passwordHash } from './store.mjs';

if (existsSync('.env')) throw new Error('Setup already exists. Use the staff command to manage accounts.');
mkdirSync('data', { recursive: true });
const secret = randomBytes(32).toString('hex');
const password = randomBytes(18).toString('base64url');
writeFileSync('.env', `APP_SECRET=${secret}\nDATABASE_PATH=./data/requests.sqlite\nAPP_ORIGIN=http://localhost:5173,http://127.0.0.1:5173\nPORT=8787\n`, { mode: 0o600 });
const { db } = openStore('./data/requests.sqlite', secret);
db.prepare('INSERT INTO staff(id,username,password_hash,role) VALUES(?,?,?,?)').run(randomBytes(16).toString('hex'), 'demo-admin', await passwordHash(password), 'admin');
db.close();
writeFileSync('data/staff-login.txt', `LOCAL DEMO ONLY\nUsername: demo-admin\nPassword: ${password}\n`, { mode: 0o600 });
console.log('Local demo created. Staff credentials: server/data/staff-login.txt. Verification emails: server/data/inbox.jsonl. Both are gitignored. No real emails will be sent.');
