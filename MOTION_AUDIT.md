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

### Site-wide motion completion — November 13, 2026

Completed the latest enhancement brief without rebuilding the site. Added text-motion.css, content-motion.css and form-motion.css: context-aware blue heading/copy hover, contextual trust/contact icons, independent staggered card/panel entrances, photo fades/zoom, responsive How It Works connectors, focus-sensitive labels, selected/touch states, FAQ feedback and directional booking transitions. Preserved route-specific heroes, shared header/footer hover, service dropdown details and green/red CTA treatments.

Fixed Home service-grid choreography coverage, entrance transforms retaining control over icon hover, and observer setup failure hiding essential sections. Observers register before motion is enabled and disconnect after use; reduced motion skips icon observers. Replaced brightness filters with color feedback. No dependencies, scroll listeners, submission delays or per-frame React state were added. Existing eager routes and image dimensions retain layout stability.

Rechecked ReflexAI in actual Chrome at1440/390: CTA transitions500ms, scrolling header400ms, early image fade200ms. These are observed reference samples; the plumbing choreography is original. No verified footer-specific reference entrance is claimed.

Validation: production build passed. All30 existing tests passed across the full run plus corrected stale card-lift assertion rerun; two additional regression tests passed for one-shot hover/entrance independence and observer-failure visibility (32 total). Production Chrome sweep covered20routes at320/390/768/1024/1440:100 checks,0 failures, max sampled CLS0. Separate18 local production performance samples also recorded CLS0. Existing axe route checks passed. Rendered desktop/mobile screenshots and booking/contact, keyboard, touch emulation and both reduced-motion modes were checked.

Additional Edge, Firefox and WebKit smoke results are retained in reports/motion-followup-browser-smoke.json; these are narrower than the full Chrome sweep. Safari and physical Android/iPhone testing remain unavailable. Local CLS diagnostics are not field Core Web Vitals. Manual device checklist above still applies. Build output is about91.72KB gzipped JavaScript and25.96KB CSS.

### Reversible scroll motion — November 14, 2026

Added useScrollMotion and scroll-motion.css: selected section headings/photos and banner trust icons now respond directly to scroll progress and reverse upward. Stable layout offsets exclude entrance transforms. One passive event-driven scroll handler batches reads/writes in requestAnimationFrame; no continuous frame loop or React state updates. Resize and preference observers clean up on route changes. Existing CSS/React motion stack retained.

Chat launcher now uses the existing Lucide Bot icon. Its noninteractive trailing line scales with document progress, sits behind the launcher and retracts upward. Buttons have smaller padding/type with minimum44px targets (hero48px). Both reduced-motion preferences reset scroll decoration. Selected photographs use scale without translation so their crops cannot expose empty edges.

Build passed; four relevant tests passed (two new scroll/responsive tests, existing mobile navigation and green CTA tests). Verified reversal, keyboard chat open/Escape/focus return, system reduced motion, no horizontal overflow and CTA target sizes at320/390/768/1024/1440. Final footer/bot screenshot reviewed in Chrome. No new physical-device or cross-browser performance certification claimed.

### Appointment, banner and outro refinement — November 14, 2026

Added coordinated hover to appointment intro and all five progress markers/labels, preserving the demo disclaimer and noninteractive step semantics. Banner copy gets restrained movement; trust icons scale/rotate independently of entrance transforms and scroll translation. Both NEXT STEP buttons (Prepare a request and Emergency guidance) now use #C62828 backgrounds/borders, white labels, a small lift and visible keyboard focus. Existing paint fills use the same red.

Expanded scroll-progress updates to section containers, outro and footer headings. Content groups and process connectors now follow scroll position instead of one-shot entrance timing. Essential content remains visible, form input stays functional and pointer hit areas in the footer remain stationary. Both reduced-motion modes disable decorative displacement. No dependencies or additional scroll listeners introduced.

Validation: production build passed;12 relevant checks passed across booking/form regressions, new inquiry/banner/red CTA tests, scroll reversal/responsive tests and glass/accessibility tests. Target widths320/390/768/1024/1440 remain free of horizontal overflow in the targeted checks. Rendered inquiry screenshot reviewed. This pass used Chrome and emulated viewport/input preferences; no physical-device or new cross-browser verification claimed.

### Creative experience upgrade — November 14, 2026

Audited React18/Vite6, React Router7, Lucide and the existing CSS/WAAPI/IntersectionObserver motion utilities, all20 routes, request/contact workflows and prior stability fixes. The deployed homepage was inspected in real Chrome (reports/creative/deployed.png). Existing ReflexAI measurements earlier in this audit inform pacing; no new reference-specific choreography is claimed.

Completed features:
- WaterRipple provides one bounded noninteractive ring on hero CTA areas and service cards. Mouse-entry only,900ms throttle, finite900ms animation; no pointermove loop or node creation per interaction. Reduced motion disables it.
- LiquidSectionDivider adds restrained SVG boundaries at How It Works and the final CTA. The footer waterline uses existing document progress; the shared photographic background stays continuous. Existing brand/link motion, green request/call hover and red emergency treatment remain.
- BeforeAfterSlider supports native range keyboard controls, mouse/touch Pointer Events with capture, visible focus, accessible values, aligned3:2 images, reset, optional caption and image-failure fallback. Homepage/Projects show an explicit empty state because no verified same-project pair exists. Synthetic swatches are test-only fixtures, excluded from production.
- Homepage service discovery supplies eight icon choices that preselect the existing short problem finder. Category questions/mappings now live separately in data/problems.js. Added demo-contact Call Now and green request actions. Safety notices, consent-based notes and real service routes remain.
- Booking Step1 now offers descriptive service cards with relevant icons and native radios, synchronized with the existing select for compatibility. Five steps, ZIP/date/contact validation, Back/Edit preservation and demo review behavior remain. No backend exists; no request is sent or slot confirmed.
- AnimatedHeading groups words by rendered line for staggered masked entrances while preserving normal responsive wrapping, selectable text, a single accessible heading name and per-route motion direction. ResizeObserver regroups on layout changes. Existing reversible section motion continues.
- Original PlumbingFlowIllustration schematics cover pipe flow, leak inspection, drain restriction/clearing and water-heater inlet/heating/outlet. Explicit Play starts finite motion; static captions remain with reduced motion. ProcessIcon supplies original consistent step artwork with contextual existing hover motion.

Architecture: reusable components in src/components, creative.css for the new feature surfaces, problems.js for finder configuration and projectComparisons.js for approved future assets. Existing routes, header, heroes, useReveal/useScrollMotion, forms and wet-paint components are reused. This implementation adds no runtime animation dependency. An unrelated local addition of Motion to package.json/package-lock.json appeared during the session; those local edits were preserved and excluded from this change's commit.

Validation:
- Production build passed; final assets approximately94.9KB gzip JavaScript and28.3KB CSS.
- All37 pre-existing tests passed across the full run and a targeted rerun updated for line-based hero animation. Three new creative tests passed: captured mouse/emulated touch dragging, keyboard/reset, homepage recommendations, booking-card preservation, ripple hit behavior and reduced SVG motion (40 tests total). Existing axe route checks reported no tagged violations.
- Production visual sweep:20 routes ×9 widths (320/360/375/390/430/768/1024/1440/1920),180 checks,70 screenshots,0 reported layout/hero/image problems. Targeted final views of finder, booking, leak/drain/heater and empty comparison were inspected at390/1440, with zero horizontal overflow.
-18 local production Chrome samples across9routes at375/1440 recorded CLS0, sampled LCP136–1220ms and sampled interaction durations16–40ms. These loopback samples are not field INP, guaranteed web vitals or physical-device performance. Images decoded correctly in the production checks.
- Mouse/keyboard and emulated touchscreen controls tested; no new physical-device or cross-browser certification is claimed. Existing manual device checklist still applies.

Assets/integration still needed: approved before/after pairs with matching viewpoints, alt text and consent; verified business/contact/coverage information; real request/scheduling endpoint and availability contract; verified reviews. See CONTENT_ASSETS.md for the component data shape and publishing guidance. Current illustrative imagery is never presented as a completed customer transformation.

### Phase 2: navigation, craftsmanship, FAQ and mobile contact - November 14, 2026

#### Audit and integration matrix

All seven earlier features are present: water ripples/liquid dividers, content-ready before/after slider, finder presets, five-step demo booking, measured heading lines/reversible scroll motion, schematic illustrations and the continuous animated footer. React18, React Router7, CSS/WAAPI, IntersectionObserver and existing motion tokens are reused. This change adds no dependency or second scroll loop; the unrelated local Motion package edit is preserved.

| Area | Existing/reused | Addition and dependencies | Regression checks |
|---|---|---|---|
| Navigation | BrowserRouter, persistent SiteLayout, eager modules, keyed route surface, hero entrances | useRouteMotion; native snapshots with WAAPI fallback; history positions by location key | Back/Forward, rapid changes, hashes, focus, header continuity, reduced motion |
| FAQ | Existing home/service content, native details, service routes, finder | FAQSection and data/faqs; search, categories, result count, empty state, links | Answer search, reset, 320px selector, keyboard disclosure, finder/booking |
| Craftsmanship | About page, heading styling, schematics, project page | CraftsmanshipShowcase, HotspotImage, data/craftsmanship; real photos pending | Topics, honest fallback, percentage coordinates, keyboard/Escape, emulated touch |
| Mobile contact | WetPaintButton, green actions, booking, chat/menu/settings | MobileContactBar; visibility and chat-attribute observers; safe areas | Hero/footer suppression, interactive sections, typing, menus, booking, tap targets |

#### Architecture and fixes

- Native route snapshots animate viewport content while header/chat/mobile controls stay independently stable: outgoing180ms/-8px, incoming420ms/+10px to rest. Header/footer stay mounted. The fallback uses a cancelable160ms outgoing WAAPI animation and420ms CSS entrance. Existing hero choreography remains; native mode suppresses duplicate route-surface animation. Viewport-sized snapshots disable default group geometry interpolation to avoid sliding/stretching tall pages when navigating from deep scroll positions.
- BrowserRouter uses useTransitions={false} so flushSync commits the eager destination inside the snapshot callback. Testing caught the asynchronous URL/render mismatch and corrected it without replacing the router. Expected ready/finished cancellation rejections are handled. Navigation tickets cancel stale callbacks on rapid navigation and history changes.
- The history listener registers in the child layout effect before BrowserRouter's parent subscription: it saves outgoing scroll before synchronous POP rendering can overwrite it. New routes focus h1 with preventScroll. Back/Forward restore entry-specific positions, including hashes; direct hashes retain target scrolling and now focus the target. Modified clicks, external/download links and same-page anchors keep their behavior. Both reduced-motion preferences retain immediate navigation.
- Earlier lazy-route shifts were already fixed by eager modules and stable image/hero dimensions. No suspense placeholder, arbitrary fixed page height, global clipping or new loading delay is added. Noncritical photos use lazy loading; small interactive components stay eager to avoid placeholder replacement shifts.
- FAQSection uses existing questions/answers only. Case-insensitive question/answer search, desktop category buttons, a labeled compact mobile selector, counts, reset and finder links share local state. Native details preserve expanded semantics; answers reveal over320ms/4px and plus becomes minus. Removed the competing nested paragraph entrance. Matching service questions also appear in finder results. No speculative business claims or structured-data promises were added.
- About has four educational craftsmanship topics, shared schematics, service/project links and a clear missing-photography note. Photo mode supports dimensioned, uncropped images and44px percentage-positioned hotspot buttons, selected-region highlights, a live explanation, close and Escape/focus return. Synthetic interaction fixtures are excluded from production. No stock or generated image is passed off as company work.
- The mobile bar is hidden near heroes, final CTAs/footer, tools, FAQs, comparisons and hotspots; also during booking, menu activity, chat, settings and input focus. It uses46px controls, safe-area insets and280ms opacity/transform transitions. The chat launcher moves above it. Observer setup failure leaves the optional shortcut hidden rather than crashing the site. No scroll listener or per-frame React updates were added.
- Call Now explicitly says Demo contact and opens /contact#contact-details, following prior authorization. verifiedPhone remains null; a verified number enables tel:. Request Service opens the existing /contact#booking-wizard. Green request/call and red emergency feedback remain. Booking still has no submission backend. CONTENT_ASSETS.md documents photo/hotspot configuration and the verified-phone requirement.

#### Physical-device checklist

Physical Android/iPhone devices are unavailable. On Android Chrome and iPhone Safari:

1. Open Home/Services/About/Contact directly, navigate, then use Back/Forward at different scroll positions and follow a booking hash link.
2. Scroll past the hero and into the footer; confirm contact-bar visibility, gesture-area spacing and chat clearance. Rotate portrait/landscape.
3. Open/close menu, chat and display settings; type with the on-screen keyboard. Confirm the bar hides and returns appropriately. Tap Request Service and test Next/Back/Edit without expecting a real submission.
4. Search/filter/open FAQs. Check VoiceOver/TalkBack names, focus order, text scaling and answer announcements. When approved photographs exist, test every hotspot and close action.
5. Enable Reduce Motion, zoom/text scaling; check green request/red emergency feedback, hero/footer readability and absence of horizontal scrolling. Demo Call Now should open contact details until a verified number is configured.

#### Final verification

- Production build passed. Final bundles are about98.19KB gzip JavaScript and29.39KB CSS. No runtime dependency was introduced. Existing package.json/package-lock.json Motion edits remain outside this commit.
-40 existing tests plus7 Phase2 tests passed across the full suite run and targeted reruns (47 distinct tests). Intermediate failures identified observer setup failure, history listener timing and test readiness; these were corrected. A finder test interrupted by a development reload also passed its clean rerun. New coverage includes history/hash focus and scroll restoration, stale-navigation cancellation, native-API fallback, reduced motion, FAQ answer search/filter/reset/keyboard, mobile visibility, hotspot alignment/Escape/emulated touch, and320/360/390/430px plus667x375 and844x390 landscape controls. Existing booking validation/Back/Edit, consent, green/red buttons, menus, images and axe checks passed.
- Production Chrome visual sweep:20 routes at320/360/375/390/430/768/1024/1440/1920,180 checks,70 screenshots,0 reported layout/hero/image problems. Final browser smoke:6 representative routes at320/390/768/1024/1440/1920 in each of Chrome157.0.8103.78, Edge157.0.4341.46, Firefox159.0 and Playwright WebKit27.2:144 layout checks, no reported issues or page errors. Each engine also passed route/history, FAQ disclosure/search, craftsmanship topics, mobile menu/bar/booking and reduced-motion interactions. WebKit tests now wait for React's rendered heading before scrolling; document load alone was insufficient test readiness.
- Settled FAQ/showcase/mobile screenshots and a transition from deep scroll were visually inspected. The header remains at its intended floating position and snapshot movement is limited to the defined small offsets. Reports are generated locally under reports/phase-two; scripts/phase-two-browser-check.mjs reproduces the cross-browser checks.
-18 local production Chrome performance samples across9 routes at375/1440 recorded CLS0, sampled LCP92-328ms and observed interaction durations16-40ms. Conditions: loopback Vite preview, no network or CPU throttling, browser PerformanceObserver. These are local diagnostics, not field INP/Core Web Vitals guarantees, Lighthouse certification or physical-device measurements. reports/local-performance.json contains the samples.
- Branded Safari and physical Android/iPhone devices were not available. WebKit is an engine test, not Safari/device verification. The manual checklist above remains required. Approved company photography/annotations, verified telephone/business details and real booking integrations are still pending; no fabricated evidence or fake submission was added.

### FAQ relocation and editorial Project Stories - November 14, 2026

- Removed the homepage FAQ block. Contact now renders the identical faqItems dataset through the existing FaqList/FAQSection below both forms and above the footer, at /contact#faq. Search, filters, mobile category selector, disclosure animation, icons and every question/answer are preserved. The homepage story note links to the new anchor; the existing service/finder FAQs remain unchanged.
- Home uses one ProjectStories section with one featured preview and two supporting cards, an aligned asymmetrical desktop grid, balanced tablet columns and a single-column mobile layout. The image-only gallery component/styles are removed. Existing shared image data remains available to /projects, whose filters and layout are preserved.
- Three supplied illustrative assets are reused with persistent preview labels. With no genuine project records, the heading is neutral and The Challenge/Our Approach/The Result explain which verified details are missing. No completed work, customer, date, price or outcome is fabricated. Project data is separate from presentation, with a publishability gate requiring approved photography and all story fields. CONTENT_ASSETS.md documents the editorial requirements and schema.
- Existing useReveal registers the story cards; headings reuse the shared section motion, images use a restrained masked fade, and descriptions stagger naturally. Hover adds a 4px lift, modest zoom, border/shadow refinement and directional arrow motion. OS and site reduced-motion preferences disable decorative transitions. No animation dependency, continuous loop or new scroll listener is introduced.
- The native full-screen story dialog supplies semantic story headings, an explicit preview notice, Back/Close controls, next/previous navigation, Escape, tab containment, focus return and scroll restoration. Pointer/touch actions remain immediate. Range controls are exempt from story arrow-key navigation. A genuine configured comparison uses the existing BeforeAfterSlider; no synthetic pair is published. The original homepage comparison is retained below the story cards.
- Responsive 640/960px JPEG copies of the three existing originals are checked in, with full-size sources retained for story details. Sources are 51-147KB at the smaller widths; originals remain unchanged. Images use explicit dimensions and stable card geometry, lazy loading and responsive source selection. The optional Windows preparation script adds no runtime dependency.
- Accessibility refinement: story buttons use their visible content as the accessible name, resolving label-in-name mismatch. Tab/Shift+Tab stay inside the dialog, and Back/Close/Escape restore the triggering card and scroll position. Scroll locking preserves an actual scrollbar gutter only; overlay-scrollbar browsers no longer receive an artificial gutter or layout shift. The dialog covers the full viewport. Mobile contact-bar visibility now includes Project Stories so it does not obscure card descriptions/actions.

Verification for this revision:
- Production build passed; final bundles approximately100.30KB gzip JavaScript and30.75KB CSS. No runtime dependencies added. Existing unrelated package.json/package-lock.json edits remain excluded.
-52 distinct tests passed across the full suite run and targeted reruns:47 existing and5 new story/relocation tests. Existing FAQ tests now target /contact#faq; the booking ZIP assertion is scoped to its own status because the relocated FAQ adds a second legitimate live status. All existing booking, consent, navigation, comparison, header/footer, service-card and WCAG-tagged axe checks pass. A test-fixture-only configured story verifies real-content rendering and the comparison slider without arrow keys changing stories while the range is focused.
- Production browser checks covered Home, Contact and Projects at320/390/768/1024/1440/1920 in Chrome157.0.8103.78, Edge157.0.4341.46, Firefox159.0 and Playwright WebKit27.2:72 route/viewport checks, no reported overflow, broken images or page errors. Story opening/navigation/Escape/focus return, Contact FAQ search/disclosure and reduced motion passed in each engine. Desktop/mobile screenshots of the editorial cards, story panel and relocated FAQ were reviewed.
- Browser PerformanceObserver measured CLS0 in the final Chrome and Edge production checks, including below-the-fold image loading and story interactions. Firefox/WebKit did not expose that metric here. These are local loopback checks, not field performance guarantees. Results and screenshots are under reports/project-stories; the reproducible script is scripts/project-stories-check.mjs.
- Emulated touch portrait/landscape,48px dialog controls, keyboard traversal, both reduced-motion settings and image-source loading were tested. Branded Safari and physical Android/iPhone devices were unavailable; the existing physical-device checklist remains applicable, with story-panel scrolling/close and Contact FAQ added to it.
- Still needed before publishing authentic company stories: permission-cleared photos, verified challenge/work/outcome text, and genuine matching before/after pairs. No project-specific outcome or comparison is invented. The existing demo booking/contact limitations remain.

### Local service request tracking demo - November 14, 2026

Scope and audit:
- The initial inspection found React/Vite, eager routes, a five-step non-persisting booking review, and no backend, database, authentication, staff panel, or mail provider. After clarification, the owner explicitly requested a demo with no existing hosting/SMTP. Implemented a working local demonstration, not a claimed production integration. The static Vercel site remains disconnected and shows honest unavailable states.
- Added a separate dependency-free Node 24+ loopback API using built-in SQLite. Requests are genuinely persisted; references and timestamps are server-generated. No initial/example requests are seeded. Setup creates only a random local staff account and encryption secret. Secrets, credentials, SQLite/WAL files, and the local test inbox are gitignored.

Interface and motion:
- New /track-request and /staff/requests routes reuse the full-width photographic HeroBanner and shared route transitions, with distinct restrained entrance variants. No existing page layout was replaced. New components are RequestTimeline and RequestConfirmation, with shared requestApi/useRequestConfig and request-status labels.
- Customer verification requires a matching reference/email plus an expiring single-use code. For this local-only demo, the code is available solely in a filesystem test inbox; no email is sent. Confirmation follows a successful database commit and offers copy reference, tracking, and home actions. Reference-prefill uses a non-secret URL parameter so the existing route animation interceptor preserves it; references alone cannot access data.
- Actual event timelines use keyed rows, 650ms/10px reveal and capped 70ms stagger. Refresh preserves existing event identity; only new events animate. Current status is labeled in text and highlighted without continuous animation. Both system and site reduced-motion preferences disable decorative motion. No new animation dependencies, per-frame React state, or scroll listeners were added.
- Manual refresh and opt-in 30-second polling fetch actual saved updates. Polling skips hidden tabs, avoids overlapping fetches, stops on expiry/unmount, and aborts outstanding refresh on logout. Requests have a 12-second timeout as well as lifecycle cancellation. No timer changes request status.
- Staff have authenticated search/filter/pagination, customer details, status changes, a device-local appointment picker converted to UTC, private notes, and event history. Optimistic versions reject concurrent/stale changes. A cancelled/completed request can be reopened only by an administrator with a private correction reason.
- Contact retains the complete FAQ and adds five tracking questions. Footer/mobile menu/Contact/confirmation gain Track Request links. Existing desktop navigation, direct Services link, PROJECT STORIES, finder-to-booking handoff, general demo contact form, and green/red button treatments remain. The two-action mobile contact bar stays hidden on the new workspaces. Demo, FAQ, chatbot, and privacy copy distinguish local test persistence from unconnected review.

Backend and security verification:
- Eight Node integration/security tests passed against real temporary SQLite files and HTTP servers: persistence across reopening, server references, concurrent idempotent submissions, payload conflicts, encrypted private fields, generic verification responses, reference-only denial, request-scoped customer sessions, code hashes/expiry/single-use/five-attempt limits, session expiry/logout/revocation, authorization, input/origin validation, rate limits, real nonlinear/rescheduled event history, private-note exclusion, administrator corrections, and conflicting staff writes.
- Server uses prepared SQL, atomic request/event/note/audit transactions, encrypted private details/notes, scrypt passwords, hashed random session credentials, keyed code/email lookup, HttpOnly SameSite cookies, bounded request bodies, database-backed rate limits, and no-store responses. Sensitive customer fields and staff notes never appear in customer tracking responses. Errors omit stack traces.
- The local inbox intentionally contains test codes for the operator, is not API-accessible, and must never be publicly deployed. This adapter does not claim email delivery or internet-grade timing resistance. Local HTTP cookies are not production Secure cookies. Production startup is rejected; the local service binds to loopback. Full production prerequisites and explicit local-demo limitations are documented in TRACKING_SYSTEM.md.

Verification:
- Full Playwright suite: 56/56 passed (52 existing + 4 tracking). After final appointment-picker, request-timeout, hero-variant, and truthful-copy refinements, 16 affected tracking/route/FAQ/story tests passed again. The real API browser flow verified five-step submission, persisted reference, code verification, staff update/scheduling, private-note exclusion, customer refresh/reload/sign-out, network and incorrect-code errors, both disconnected pages, navigation integration, and six-width reflow. WCAG-tagged axe passed the original routes and new verification, customer result, staff sign-in, and authenticated staff detail/editor states.
- Production build passed; approximately107.57KB gzip JavaScript and32.01KB CSS in the final build. No new runtime dependency; existing unrelated root package.json/package-lock.json edits remain outside this work.
- Local setup command completed successfully; credentials and private local files were confirmed ignored by Git. TRACKING_SYSTEM.md documents schema, endpoints, roles, lifecycle, setup, environment-variable names, staff management, test commands, and the Android/iPhone manual checklist. No paid provider, real notification, public staff account, or production appointment was created.
- Final production browser sweep: Chrome157.0.8103.78, Edge157.0.4341.46, Firefox159.0, and Playwright WebKit27.2. Each passed18 layout checks (verification form, restored customer result, authenticated staff detail at320/390/768/1024/1440/1920):72 checks total, no reported overflow, broken images, or page errors. Each engine passed actual code verification, persistence-backed staff updates, opt-in polling, reload/session restoration, sign-out, and reduced-motion checks. Desktop/mobile screenshots were visually inspected.
- Browser PerformanceObserver measured a maximum CLS of0.0156 in Chrome and0.0142 in Edge during the final local production checks. Firefox and WebKit did not expose this metric; their values are not claimed as zero. These loopback, unthrottled samples are diagnostics, not field performance guarantees or Lighthouse certification. Reports/screenshots: reports/tracking; reproducible runner: scripts/tracking-browser-check.mjs.
- Final production build after copy cleanup passed:107.57KB gzip JavaScript,32.01KB CSS. A separate connected local preview was started at http://127.0.0.1:5178 with the API on loopback8787; the existing development server was left running. Tracker verification and staff login were checked on this preview. The persistent local demo database starts empty; automated tests used separate temporary databases.
- Branded Safari, physical Android/iPhone devices, real email/SMS delivery and public production infrastructure were not tested or provisioned. WebKit is engine coverage only. TRACKING_SYSTEM.md includes the physical-device checklist and required work for any future production conversion.
