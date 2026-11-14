import { randomBytes } from 'node:crypto';
import { openStore, passwordHash } from './store.mjs';
const [action, username, role = 'staff'] = process.argv.slice(2);
if (!['create', 'disable', 'reset'].includes(action) || !/^[a-zA-Z0-9._-]{3,80}$/.test(username || '') || !['staff', 'admin'].includes(role)) throw new Error('Usage: npm run staff -- create|disable|reset username [staff|admin]');
const { db, transaction } = openStore(process.env.DATABASE_PATH || './data/requests.sqlite', process.env.APP_SECRET || '');
const password = randomBytes(18).toString('base64url');
const password_hash = await passwordHash(password);
transaction(() => {
  const user = db.prepare('SELECT * FROM staff WHERE username=?').get(username);
  if (action === 'create') db.prepare('INSERT INTO staff(id,username,password_hash,role) VALUES(?,?,?,?)').run(randomBytes(16).toString('hex'), username, password_hash, role);
  else {
    if (!user) throw new Error('Staff account not found.');
    if (action === 'disable') db.prepare('UPDATE staff SET active=0 WHERE id=?').run(user.id);
    else db.prepare('UPDATE staff SET password_hash=? WHERE id=?').run(password_hash, user.id);
    db.prepare("DELETE FROM sessions WHERE kind='staff' AND subject=?").run(user.id);
  }
  db.prepare('INSERT INTO audit(actor,action,created_at) VALUES(?,?,?)').run('local-cli', `${action}:${username}`, new Date().toISOString());
});
db.close();
console.log(action === 'disable' ? 'Account disabled; sessions revoked.' : `Generated password (store securely): ${password}`);
