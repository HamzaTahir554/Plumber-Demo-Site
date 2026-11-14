import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomBytes, createHmac, createCipheriv, createDecipheriv, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
export const token = () => randomBytes(32).toString('base64url');
export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const result = await derive(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `${salt}:${result.toString('hex')}`;
}
export async function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(':');
  const result = await derive(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(result, Buffer.from(hash, 'hex'));
}
export function openStore(path, secret) {
  const key = Buffer.from(secret, 'hex');
  if (key.length !== 32) throw new Error('APP_SECRET must contain 64 hexadecimal characters.');
  const db = new DatabaseSync(path);
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const hash = value => createHmac('sha256', key).update(value).digest('hex');
  const seal = value => {
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map(part => part.toString('base64')).join('.');
  };
  const unseal = value => {
    const [iv, tag, encrypted] = value.split('.').map(part => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', key, iv); decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
  };
  const transaction = work => {
    db.exec('BEGIN IMMEDIATE');
    try { const result = work(); db.exec('COMMIT'); return result; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  return { db, hash, seal, unseal, transaction };
}
