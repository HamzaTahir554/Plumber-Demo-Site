# Motion reference and implementation audit

Reference: https://www.reflexai.com/ — inspected in local Chrome at 1440x900 and 390x900. Screenshots and sampled Web Animations API records are in ignored reports/reflex-*.png and reports/reflex-observations.json. No reference source or artwork was copied.

## Verified observations

| Interaction | Trigger | Duration / easing | Direction / distance | Stagger / scroll / mobile |
|---|---|---|---|---|
| Arrow exchange | Pointer hover on announcement link | 500ms, cubic-bezier(.36,0,.114,.92) | Incoming -8px to 0, outgoing 0 to 8px; opacity and scale | No delay; sampled on both viewport sizes with a mouse |
| Header surface change | Downward scroll | 400ms, cubic-bezier(.4,0,.2,1) | Background opacity; header also entered scrolled-down state | No stagger; no scroll locking observed |
| Partner-logo reveal | Scrolling into partner area, desktop | 800ms, cubic-bezier(.4,0,.2,1) | 40px upward, opacity 0 to 1 | Recorded 200ms and 300ms delays |
| Text/section theme change | Scroll at mobile 2600px | 800ms color; 1000ms opacity | Fade, no verified translation for this sample | Scroll triggered; not a measured continuously scrubbed effect |
| Mobile announcement / logo marquees | Running during observation | About 6.03s / 51s respectively | Horizontal 0 to -50% | Continuous; deliberately not adopted |
| Decorative waveform | Mobile samples | 300ms bars with staggered delays; 500ms wrapper | Scale transitions | Decorative; deliberately not copied |

Initial sampling began two seconds after navigation: no desktop load animation was active then. Exact initial hero choreography, generic card hover timing, footer entrance timing, and every product showcase sequence were not reliably captured. These are not claimed as reference facts. Cookie-banner motion was excluded from inspiration. Mobile inspection used a narrow viewport; physical-device touch performance remains unverified.

## Original implementation

- Shared tokens: 1100ms hero, 1000ms image, 820ms section, 480ms card, 450ms icon.
- Route-specific hero motion retained, with whole-heading clip reveal; labels, copy, CTAs, then supporting content. No per-letter wrappers.
- Section headings use a masked upward reveal; copy follows at 160ms. Service photography and headings have coordinated entrances without changing hover transforms.
- Existing four-step How It Works stagger, icon responses and progress strokes preserved. A CSS view-timeline accent draws beneath its heading on desktop, with an unsupported-browser fallback that omits only the decoration.
- Footer columns enter in 80ms increments using the existing IntersectionObserver.
- Mobile displacement is 10px instead of 18px; footer stagger is removed. No new scroll listener, dependency, or loop.
- Existing blue-to-green wet paint, emergency red vibration, compact header, measured hero offset, Commercial blue text, and photography retained. The scrolling tool remains deleted.
- Reduced-motion settings suppress new decorative motion. Ordinary copy remains selectable. Content defaults visible without observer activation.

Files: src/story-motion.css, src/hooks/useReveal.js, src/main.jsx. Existing motion files remain responsible for interactions rather than duplicating button or card event systems.

Limits: Chrome verification is not a Safari/Firefox or physical-device performance certification. Reference timing samples capture CSS/WAAPI effects, not all possible JavaScript-rendered effects.

Validation: 29 browser tests passed; production build passed. Local Chrome performance samples across nine routes at 375/1440px recorded CLS 0–0.0156 and sampled interaction durations 16–40ms. These are loopback diagnostics, not field INP or low-end phone measurements. Small initial lazy-route shifts remain; no claim of zero CLS is made.
