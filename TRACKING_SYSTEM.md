# Local service request tracking demonstration

Implemented for the owner's clarified scope: **a local demo, no hosted backend or mail provider**. The site is still a React/Vite SPA. No paid service, new animation library, or public staff registration was added. This is not a production booking service. Use fictional details only.

## Run it

Requires Node 24 or later (uses the built-in SQLite module). From the project root, one-time setup:

```powershell
cd server
npm run setup
```

Setup creates a random encryption secret, a SQLite database, and a random `demo-admin` password. Read **server/data/staff-login.txt** locally for the credentials. These files are ignored by Git. Setup never overwrites an existing `.env`.

Start the API in that terminal:

```powershell
npm start
```

In a second terminal at the project root:

```powershell
$env:LOCAL_REQUEST_API = '1'
npm run dev -- --host 127.0.0.1
```

Open **http://127.0.0.1:5173/contact**. Use fictional information, complete the five steps, and choose **Submit test request**. Success appears only after SQLite commits. Copy the generated reference or follow Track request. Enter the same email, request a code, and read the matching message from **server/data/inbox.jsonl**. That is a local test inbox, not delivered email. Never publish that file or expose the API to the internet.

Open **http://127.0.0.1:5173/staff/requests**, sign in with the generated credentials, open the request, and save a status update. Refresh the customer tracker to see the saved event. The optional refresh checkbox fetches every 30 seconds while the tab is visible; it does not simulate progress.

The command-line `--host` above matters: the existing root npm dev script specifies `0.0.0.0`. Override it with `127.0.0.1` for this local-only demo. Do not use a public tunnel. Ordinary `npm run dev` without `LOCAL_REQUEST_API=1`, and the existing static Vercel deployment, retain the disconnected demo review and show an honest tracking-unavailable page.

To return to the original disconnected mode:

```powershell
Remove-Item Env:LOCAL_REQUEST_API -ErrorAction SilentlyContinue
npm run dev
```

## Local configuration (names only)

`server/.env` is loaded by the backend package:

| Variable | Purpose |
| --- | --- |
| `APP_SECRET` | Random 32-byte key encoded as 64 hex characters. Encrypts private fields and keys credential hashes. Losing it makes private records unreadable. |
| `DATABASE_PATH` | Persistent local SQLite path, default `./data/requests.sqlite`, relative to the server working directory. |
| `APP_ORIGIN` | Comma-separated exact local HTTP origins allowed for mutations. Default localhost/127.0.0.1 port 5173. |
| `PORT` | Loopback API port, default 8787. Keep the Vite proxy target in sync if changed. |
| `LOCAL_REQUEST_API` | Set to `1` in the frontend terminal to enable Vite's same-origin local proxy. Not a browser secret. |

There are no SMTP, SMS, paid-provider, or cloud database credentials. The server deliberately refuses `NODE_ENV=production` and binds only to loopback. Do not put `APP_SECRET` into a `VITE_` variable. OS file access controls still matter on Windows; POSIX file modes alone do not establish Windows ACLs.

## Architecture and schema

- `server/app.mjs`: bounded JSON HTTP endpoints, validation, authorization, rate limits, sessions, request lifecycle and customer projections.
- `server/store.mjs` / `schema.sql`: durable SQLite with WAL, foreign keys, prepared statements and explicit transactions. No browser database and no fake records.
- `requests`: random internal ID; unique `PS-` plus 16 random hexadecimal characters; keyed email lookup; encrypted contact/name/address/issue data; service, preferences, status, version, timestamps; unique idempotency hash and payload hash.
- `events`: append-only application status history, prior/new status, server time, actor, customer message, appointment snapshot. Rescheduling preserves the earlier appointment event.
- `notes`: separate encrypted staff-only notes and correction reasons.
- `staff`: scrypt password hashes, staff/admin role, active flag.
- `sessions`: only hashes of random session credentials, scope and absolute expiry.
- `challenges`: keyed hashes of random 8-digit codes, expiry, attempt counter, single-use marker, optional matched request ID. Unknown references receive an indistinguishable public challenge response.
- `limits`: database-backed counters so restarting the server does not reset active limits.
- `audit`: staff sign-in/access/update and CLI account-management actions. Local database owners can modify this database; the audit is not an independently tamper-proof compliance log.

Private fields use AES-256-GCM with unique random nonces. Sensitive lookup/code/session values use keyed SHA-256. Cookies are HttpOnly, SameSite=Strict, scoped to `/api`, and deliberately HTTP-only for the loopback demo. Production would require HTTPS and Secure cookies. Customer sessions last 30 minutes; staff sessions last 60 minutes. Staff activity/role is checked server-side on every protected action. Logout, disable, and password reset revoke relevant sessions.

## API contract

All responses are `no-store` JSON. Mutations require an explicitly allowed Origin and JSON; cross-site fetches are rejected. Request bodies are capped at 16KB. No public CORS is enabled. No session or verification credentials appear in URLs or browser storage.

| Method / endpoint | Access and behavior |
| --- | --- |
| `GET /api/config` | Public availability; identifies local-demo and local-test-inbox modes. |
| `POST /api/requests` | Public validated fictional request; requires random `Idempotency-Key`. Returns reference only after persistence. Reusing a key with changed contents returns 409. |
| `POST /api/verification/start` | Reference and email. Generic matched/unmatched response and random challenge. Code goes only to the local operator inbox for a match. |
| `POST /api/verification/complete` | Challenge and code. Five attempts, ten-minute expiry, single use. Establishes a request-scoped customer cookie. |
| `GET /api/tracking` | Customer session; returns only its request, regardless of any submitted query reference. Excludes contact/address/issue, staff actors, notes and correction reasons. |
| `POST /api/tracking/logout` | Revokes customer session and expires cookie. |
| `POST /api/staff/login` | Username/password; generic failure; limits by source and account; random session. |
| `GET /api/staff/session` | Authenticated staff identity and role. |
| `POST /api/staff/logout` | Revokes staff session and expires cookie. |
| `GET /api/staff/requests` | Staff; exact-reference search, status filter, 50-item pagination (`offset`). |
| `GET /api/staff/requests/:reference` | Staff; customer details, notes and actual history. Audited access. |
| `PATCH /api/staff/requests/:reference` | Staff; status, appointment UTC timestamp, public message, private note, optional correction reason, expected `version`. Atomic event/note/audit update, 409 for stale version. |

Request rate limits: 12 submissions/hour/IP; 20 code requests/hour/IP and 5 per reference/email pair/15 minutes; 30 verification attempts/15 minutes/IP plus five per challenge; 15 staff sign-ins/15 minutes/IP and 10 per username; 600 overall requests/minute/IP. Source identity uses the direct socket, never untrusted forwarded headers. This is appropriate for a single local operator, not public shared-proxy traffic. Expired sessions, challenges and counters are cleaned every minute.

The local inbox necessarily contains plaintext test codes to let the operator act as the recipient. It is an explicit test fixture with filesystem-only access, never an API route or frontend asset. The request database stores code hashes only. Local filesystem delivery can have timing differences between matches and misses; this demo does not claim internet-grade timing resistance. A real deployment requires a queued real delivery adapter with uniform public response behavior and further security review.

## Lifecycle

| Current | Allowed next statuses |
| --- | --- |
| submitted | under_review, awaiting_customer, scheduled, cancelled |
| under_review | awaiting_customer, scheduled, cancelled |
| awaiting_customer | under_review, scheduled, cancelled |
| scheduled | under_review, awaiting_customer, in_progress, cancelled |
| in_progress | awaiting_customer, completed, cancelled |
| completed / cancelled | Correction by admin only, with a reason of at least 10 characters |

Same-status updates support reschedules, customer messages, or private notes. Unchanged writes are rejected. Scheduled requires an appointment; staff choose a device-local date and time, and the client converts it to an explicit UTC timestamp for the API. Preference is never treated as a confirmed appointment. Status changes and public appointment/message changes add events; private-note-only updates do not add a misleading customer milestone. No timers advance statuses. Staff can clear appointment details when cancelling or revising a request. Existing history is never replaced through the API.

From `server/`, account management:

```powershell
npm run staff -- create reviewer staff
npm run staff -- reset reviewer
npm run staff -- disable reviewer
```

Create/reset generates a random password rather than accepting one in shell history. Store it securely. Administrator corrections remain private notes; customers see the resulting actual status event.

## Website integration

- Existing booking keeps its five steps and problem-finder selection/consented description. Local API availability enables real test submission; disconnected demo review never claims persistence.
- Retry identity uses a random key and SHA-256 fingerprint in sessionStorage, not customer fields. In-memory fallback supports retries if storage is unavailable. Edit controls are disabled during submission. The server is authoritative for duplicates.
- Confirmation has Copy Reference, Track Request, Return Home. A **public reference only**, never a credential, may prefill the tracking URL. It cannot unlock request information.
- `/track-request`: verification form, current status, preferences vs appointment, timestamps in the device timezone, actual event timeline, manual refresh, opt-in polling, logout and demo support.
- `/staff/requests`: protected data and actions, sign in/out, search/filter/page, details, status editor, scheduling, public messages, separate notes and corrections. The sign-in shell is public; all staff data/actions are authorized on the server.
- Track Request appears in the mobile menu, Contact page, Helpful Links footer and confirmation. Desktop navigation and two-action floating contact bar remain compact. The bar hides on tracking/staff pages.
- Contact retains its full FAQ and gains five truthful tracking questions. PROJECT STORIES remains completely separate. General contact-message form remains a disconnected demo.
- Timeline uses actual keyed events with restrained 650ms/10px entrances and 70ms capped staggering. Existing entries do not replay when refreshing. Both reduced-motion settings disable decorative timeline/confirmation motion. No fake percentages, continuous animation, layout-height animation, or new motion dependency.

## Reproducible verification

```powershell
npm test --prefix server
npx playwright test
npm run build
node scripts/tracking-browser-check.mjs
```

API tests use a real temporary SQLite database and real HTTP server with an isolated in-memory test mailbox. Browser tests forward requests to that server; they do not mock statuses or persistence. The production browser script runs a temporary local API and preview server, and cleans them up. It writes local reports/screenshots under ignored `reports/tracking`.

See `MOTION_AUDIT.md` for completed test results and limitations. No real SMTP delivery, actual appointments, physical Android/iPhone devices, or branded Safari can be verified in this environment.

### Physical Android/iPhone checklist (not performed)

On an appropriately configured test deployment, using fictional data:

1. Complete all five booking steps with the on-screen keyboard, including Back/Edit. Double-tap Submit and retry after a connection interruption; verify only one saved request/reference.
2. Copy the reference, open Track Request, enter an expired or incorrect code, then verify with a fresh code. Check TalkBack/VoiceOver labels, error announcements, focus, and text scaling.
3. Rotate portrait/landscape. Ensure the floating header and chat control do not cover fields, timeline items, or buttons. Confirm the mobile contact bar stays hidden on tracking/staff pages.
4. Save a staff reschedule in a second authenticated browser. Check manual refresh, optional polling, background-tab pause, timezone display, and unchanged earlier events.
5. Test session expiry, logout, direct URL reload, Back/Forward, reduced motion, low connectivity, and no private notes/contact fields in the customer view.

## Before considering a public release

This clarified demo scope intentionally stops short of production activation. A public version needs chosen persistent hosting/database and backups/restore, actual SMTP or other verified-channel delivery, removal of the local inbox adapter, TLS/Secure cookies, deployment-origin and trusted-proxy configuration, stronger staff account administration/MFA, abuse monitoring, retention/deletion policy, verified business/support/privacy details, incident operations, and production load/security testing. The current Vercel static deployment cannot persist SQLite files; do not deploy this local server there as an ephemeral function. No production readiness or email delivery is claimed.

Technical references used: [Node SQLite API](https://nodejs.org/api/sqlite.html), [OWASP verification guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). SMTP was considered but intentionally not integrated after the owner confirmed demo-only scope.
