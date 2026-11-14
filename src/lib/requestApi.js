export async function requestApi(path, options = {}) {
  let response;
  try {
    const timeout = AbortSignal.timeout(12000);
    response = await fetch(`/api${path}`, { credentials: 'same-origin', cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout });
  } catch { const error = new Error('The request service is unavailable. Check your connection and retry.'); error.status = 0; throw error; }
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The local request service is not connected.');
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || 'Unable to complete this action. Please retry.'); error.status = response.status; throw error; }
  return result;
}
export const post = (path, body = {}, options = {}) => requestApi(path, { method: 'POST', body: JSON.stringify(body), ...options });

// Retry identity is retained without storing form contents or authentication credentials.
export async function submissionKey(values) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(values)));
  const fingerprint = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const previous = JSON.parse(sessionStorage.getItem('request-retry') || 'null');
    if (previous?.fingerprint === fingerprint) return previous.key;
  } catch { /* Storage is optional; caller also retains the key in memory. */ }
  const key = crypto.randomUUID();
  try { sessionStorage.setItem('request-retry', JSON.stringify({ fingerprint, key })); } catch { /* optional */ }
  return key;
}
