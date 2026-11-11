# Accessibility verification report

**Target:** WCAG 2.2 Level AA. This is a design and test target, not a certification or legal ADA determination.

## Implemented

- Semantic header, navigation, main, footer, one page heading per route, skip link, descriptive page titles, and route descriptions.
- Keyboard-operable mobile navigation, service submenu, FAQs, chat, forms, and accessibility settings. Opening a menu by keyboard moves focus into it; Escape closes it and returns focus to its trigger. The settings dialog traps focus and restores it when closed.
- Visible focus outlines, text labels, error summary and field errors, status text for demo form completion, and a screen-reader-announced chat log.
- Responsive layout from 320 CSS pixels upward, reduced-motion CSS, optional high contrast and text-size controls, and image alt text based on purpose. Scroll reveals run once when their section enters view; content remains visible when the observer is unavailable. Hover motion is decorative; active links, selection, errors, and progress remain understandable without it.
- Display preferences open from the footer on every route and from a visible Emergency-page control. The decorative scroll wrench stays inside the floating header on desktop and mobile and hides for reduced motion.
- Emergency guidance prioritizes water shutoff only when safe, electrical hazards, and gas-leak evacuation.

## Automated checks

- Glass-header contrast against a dark backdrop and ordered process-card alignment passed at 320, 390, 768, 901, 960, 1024, 1440, and 1920 CSS pixels. The transparent header uses light reading surfaces for navigation contrast. Separate checks cover text-hover geometry, selection, editable fields, subtle label/legal feedback, and reduced motion; Emergency info is checked at mobile, tablet, and desktop widths for red/white hover, stable header geometry, and working navigation. Process cards remain informational and do not add unnecessary keyboard stops. Commercial hero colors are deep blue over a light gradient.

- `npm run test:e2e`: **27/27 passed** in local Chrome. The suite visited all 20 routes, checked the 23 public image URLs, exercised keyboard menus, route focus, chat, the problem finder, booking validation, ZIP and gallery controls, display settings, hero CTAs, shared banner geometry and text colors, distinct hero entrances, floating-header position, logo and CTA motion, scroll-driven wrench progress and attachment, the shared NEXT STEP/footer photo at mobile, tablet, and desktop widths, wet-paint CTA expansion and retraction, booking and contact button behavior, the Emergency and footer settings controls, labeled development review samples, representative card layouts, service-card details on hover, focus, and touch, form feedback, footer text contrast, section reveals, and reduced motion.
- `npm run visual:check`: **160 route-width combinations** at 320, 375, 390, 430, 768, 1024, 1440, and 1920 CSS pixels; no horizontal overflow, clipped page headings, broken images, missing hero images, incomplete hero image coverage, or out-of-bounds hero text and CTAs were detected. The script saved 70 screenshots in `reports/visual/`.
- Axe with WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA tags reported **no violations on the 20 tested routes**. The audit ran after entrance animations finished.
- No browser console errors were observed in the route test.
- `npm run build` passed; `npm audit --omit=dev` reported 0 vulnerabilities.
- A local production preview sampled LCP, CLS, and chat interaction event durations on nine representative routes, including Commercial, at 375 and 1440 pixels. CLS was 0 in all 18 samples. These loopback observations are diagnostic, not field Web Vitals or a complete INP assessment.

Automated checks can flag issues, but they cannot prove WCAG conformance.

## Manual checks still needed before production

- NVDA with Chrome and VoiceOver with Safari across all routes and interactive controls.
- Keyboard-only navigation through mobile menu, submenu, chat, forms, and settings.
- 200% and 400% zoom, 320 px reflow, touch target review on actual devices.
- Contrast review with verified brand content and any replacement images.
- Usability review of the real booking flow and real emergency contact path after integration.

## Known limits

- Demo business details and the legal template must be replaced or reviewed. No fabricated customer reviews are published. The enhanced icon artwork removes the original unverified claims.
- Chat responses are deterministic, and the forms do not submit. There is no live human escalation or dispatch. The ZIP checker validates format while coverage data is unavailable; gallery images are illustrative rather than verified customer projects.
- No formal screen-reader or legal compliance certification is claimed.
