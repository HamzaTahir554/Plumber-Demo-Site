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

## Stability follow-up — November 12, 2026

### Root cause and fix

The route-level React Suspense boundary in main.jsx rendered `.page-loading` with a generic 45vh height inside SiteLayout. The footer was already mounted beneath it. A delayed Services module reproduced CLS 0.01556 at 390px: a visible bottom-of-viewport fragment disappeared when the loading subtree was replaced. This was not a photography or font swap: supplied images retain explicit dimensions/object-fit and the site has no downloadable webfont declarations.

Page modules now load eagerly, so the first committed layout contains the real route and footer together. The temporary loading component and its CSS were removed. No arbitrary reserved height, overflow suppression, or rendering delay was introduced. Tradeoff: the initial JS gzip grew from about 79.05KB to 91.34KB, consolidating the existing page chunks rather than adding dependencies. Navigation no longer replaces page content with a short loading placeholder.

useReveal now batches all geometry reads before applying motion classes. This prevents interleaved style writes and getBoundingClientRect reads from repeatedly flushing layout. Existing observers unobserve revealed elements and disconnect on unmount. The header scroll handler already updates React state only when crossing its scrolled threshold; no per-frame React render loop was found. Existing transforms, opacity, and bounded text masks remain; no animations were removed. Fonts, image aspect ratios, touch controls, and measured header clearance remain unchanged.

### Measurements

Production build and 29 existing automated tests passed; an added route-loading regression test also passed. Chrome PerformanceObserver samples across nine routes at 375/1440px measured CLS 0 in all 18 cases (previous maximum 0.0156). A separate Services run at 390px with 4x CPU slowdown, 150ms latency and 200KB/s download also measured CLS 0. These are local browser diagnostics, not field Core Web Vitals. The diagnostic sum of non-input shifts is a conservative upper bound rather than a full session-window CLS implementation.

### Physical-device checklist (not performed)

- Android Chrome and iPhone Safari: open Services and Contact directly on a cold cache over cellular; confirm no footer/loading flash or jumping content.
- Rotate portrait/landscape, expand/collapse browser chrome, and open/close the menu; check hero clearance, scroll unlock and tap targets.
- Scroll through service cards, process steps and footer; check smoothness, image loading and no horizontal scrolling.
- Tap green CTAs and Emergency Info; complete demo booking validation and check keyboard visibility/focus.
- Enable system Reduce Motion, increase text size, and test pinch zoom and screen-reader navigation.

Safari requires macOS/iOS and is not available on this Windows host. Playwright WebKit, if tested below, is an engine compatibility check and must not be described as Safari verification. No physical-device verification is claimed.

### Completed cross-browser verification — November 13, 2026

Each run covered all 20 routes at 320, 390, 768, 1024 and 1440 CSS pixels (100 combinations per browser), with animations enabled. Checks covered horizontal overflow, header/hero clearance, decoded images, footer reachability, mobile Request Service navigation, and reduced-motion hero behavior.

| Browser / engine | Version | Result | CLS |
|---|---|---|---|
| Google Chrome | 157.0.8103.78 | 100/100 passed | 0 across all samples |
| Microsoft Edge | 157.0.4341.46 | 100/100 passed | 0 across all samples |
| Playwright Firefox | 159.0 | 100/100 passed | API unavailable; not measured |
| Playwright WebKit on Windows | 27.2 | 100/100 passed | API unavailable; not measured |
| Apple Safari | Unavailable | Not tested; requires Apple OS | Not measured |

The full functional suite ran in Chrome (29 existing tests plus one new regression test passed); the other engines ran the route/layout and navigation smoke checks described above, not the complete functional suite. Physical devices were unavailable. Screenshots, metrics and browser reports are local ignored artifacts in reports/. Reproduce with a production preview on port 4174 and node scripts/cross-browser-check.mjs; BROWSER_FILTER optionally selects Chrome, Edge, Firefox or WebKit.

All measured CLS results are below the 0.1 target. No field performance, Safari compatibility, or physical-device smoothness claim is made. Earlier notes about remaining lazy-route shifts describe the pre-fix baseline and are superseded by this follow-up.

### Footer hover refinement — November 13, 2026

- Ordinary footer links now reveal a curved blue flow trace ending in a small rotating valve accent. This replaces their straight underline without changing destinations.
- Column headings use a two-part accent; descriptive text gently brightens and the hours icon tilts. Noninteractive text remains selectable with its normal cursor. Existing CTA wet paint and footer entrance choreography are preserved.
- New effects use CSS transforms/opacity, with no event listeners or dependencies. Keyboard focus decoration is immediate; OS and site reduced-motion preferences disable decorative transitions.
- Chrome viewport checks passed at 320, 390, 768, 1024 and 1440px: no horizontal overflow, hover layers visible, rapid exits reset, keyboard outline visible, and reduced-motion transitions disabled. Desktop/mobile screenshots reviewed. Emulated touch navigation to Maintenance passed.
- Five existing tests in glass.spec.js and green-actions.spec.js passed. Production build passed. This footer follow-up was not separately verified in Firefox, Edge, Safari or on physical devices; the earlier broader results above predate this change.

### Shared header/footer hover revision — November 13, 2026

Supersedes the curved footer trace/valve treatment above. Header navigation and footer links now share a center-out fine underline, soft blue highlight, and existing restrained text movement. Logo hover uses a gentle scale in both locations; footer headings have a simple accent. The previous valve decoration and logo tilt are removed. Mobile navigation uses a short underline, active routes remain marked, and CTA paint/colors are unchanged.

Styles are consolidated in src/chrome-hover.css (replacing footer-hover.css), with no new JavaScript or dependencies. Keyboard decorations appear immediately; reduced-motion preferences preserve static feedback. Chrome checks passed at 320, 390, 768, 1024 and 1440px, including screenshots, overflow, hover reset, keyboard outline, reduced motion and emulated touch navigation. Eight selected existing tests passed (five glass/CTA tests and three navigation tests). Production build passed. This revision was not tested on physical devices or in other browsers.
