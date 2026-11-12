# Plumber-Demo-Site

Responsive React/Vite demo website for a U.S. plumbing business. The site uses the supplied image set and aims toward WCAG 2.2 AA. Business identity, service areas, credentials, hours, contact channels, and customer reviews are **not verified**.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To build the static site:

```sh
npm run build
npm run preview
```

The build output is `dist/`. Configure the host to serve `index.html` for client-side routes such as `/services/leak-repair`. There is no backend.

Run the browser checks with `npm run test:e2e`. They use local Chrome on Windows when available; otherwise install Playwright Chromium with `npx playwright install chromium`. The checks cover all routes and images, keyboard navigation, the problem finder, booking flow, ZIP checker, gallery filters, chat, responsive overflow, reduced motion, and axe on every route.

For visual checks, run `npm run build` and `npm run preview -- --port 4174`, then set `SITE_ORIGIN=http://127.0.0.1:4174` and run `npm run visual:check` in another terminal. This captures desktop and mobile screenshots and checks every route at 320, 360, 375, 390, 430, 768, 1024, 1440, and 1920 CSS pixels. The output is in `reports/visual/`.

## Pages and features

- Full-width image banners on every route use the same `HeroBanner` layout, height, typography, and button sizing. Commercial uses deep blue text over a light gradient; other pages use white text over navy. Each of the 20 routes has its own subtle hero entrance sequence while keeping its relevant image and responsive focal position. The homepage hero's "Call Now" CTA opens demo contact details until a verified phone number is supplied.
- Home, all services, six service detail pages, problem finder, service area checker, illustrative project gallery, maintenance hub, residential, commercial, emergency, about, contact, reviews, accessibility, and privacy template (20 routes total).
- Mobile navigation shares the desktop glass style, includes both blue CTAs, and locks background scrolling while open. Content-sized mobile heroes use responsive typography and page-specific image crops. Responsive navigation includes a direct Services link, Escape handling, route focus, active-link underline, a floating fixed header, and shared button/card motion. A decorative wrench tracks page scroll directly below the header, with a progressively revealed blue line on desktop and mobile, and hides for reduced motion. Section, image, card, icon, FAQ, booking, and chat motion use coordinated timing.
- The final NEXT STEP section and footer share one continuous water-wave photo layer. A dark navy overlay keeps the existing links and copy readable across both sections.
- The rounded header uses a unified translucent light-blue glass surface, a 14px backdrop blur, and an opaque fallback. A translucent navy overlay over the blue glass keeps text crisp without halos. Emergency info and Request service have blue defaults; other header controls remain transparent and the Services link opens /services directly on desktop and mobile. Its logo has a brief entrance and hover response. Standard navigation links use a rounded highlight; header, footer, booking, and contact CTAs use a clipped cursor-origin wet-paint fill. Header and footer CTAs move down 3px on hover. Emergency info has a blue-and-white default treatment, red-and-white hover/focus, and one 310ms hover vibration; tablet navigation uses an accessible icon-only version. Footer text links reveal an underline and shift right; demo phone and email links open the contact-details section.
- How It Works is a four-step ordered list with equal-height cards, SVG icons, 120ms entrance staggering, and separate entrance and hover transforms. Shared motion tokens coordinate interactive links, FAQ triggers, contextual icons, and card feedback. Typography responds with a subtle 460ms shade change; headings lift 2px without reflow. Paragraphs, labels, and legal copy do not move. Selection and editable content are protected, and reduced-motion preferences suppress decorative movement.
- Finder choices, booking progress, gallery filters, and form feedback have brief state transitions. Service, audience, maintenance, process, gallery, emergency, information, and form cards have purpose-specific spacing, borders, and depth. Service cards keep their photo, title, and link visible, reveal their short description on hover or keyboard focus, and show it by default on touch screens. Gallery and process cards remain informational.
- The floating accessibility launcher is replaced by an Emergency-page control. The footer Accessibility options button still opens the same settings on every route.
- Google review cards are ready for verified data in `src/data/reviews.js`. Local development shows two clearly labeled layout samples; production shows an honest empty state until genuine reviews and source links are supplied.
- A three-step, rule-based problem finder that recommends a possible service and flags urgent safety guidance. Optional notes move to the request form only with user consent.
- A five-step demo request flow with field validation, progress, editing, and review. The general message form also validates fields. Neither form sends data or books a visit.
- A ZIP checker that validates U.S. format. Coverage remains unconfirmed until verified ZIP data is added in `src/data/site.js`.
- An illustrative, filterable gallery. These are supplied concept images; no before/after project claims are made. The maintenance hub links practical notes to public sources.
- Deterministic demo plumbing chat, available on every page. Conversation history is kept in session storage for the current tab session. It is not a live AI service.
- Contrast, text size, and motion preferences stored locally when browser storage is available.
- All 23 supplied JPG images have restyled variants in `public/assets/images/enhanced/`. The original JPGs remain in `images/`. The enhanced logo is a transparent PNG with its name rendered as live HTML text.

## Before a real launch

1. Replace “Company name,” the demo phone number and email, hours, service areas, and draft brand copy with verified business information.
2. Confirm actual services, emergency availability, team details, credentials, and any guarantees. The original `trust-icons.jpg` and `accessibility-badge.jpg` contain unverified claims; the enhanced site versions remove those claims.
3. Add authentic, permitted customer reviews and their source links to `src/data/reviews.js`. The production Reviews page intentionally publishes none until verified data is available.
4. Supply verified service-area ZIP codes and real, permitted project photo pairs before making coverage or before/after claims.
5. Connect forms to a secure backend or booking provider. Add spam protection, delivery monitoring, and an actual confirmation flow. Do not use the demo completion state as proof of a booking.
6. If a live AI assistant is desired, use a server-side API endpoint and keep provider keys off the client. Define escalation and monitoring processes.
7. Finalize the privacy policy against actual data practices and add a sitemap after the production domain is known.
8. Complete manual accessibility review with keyboard, screen reader, zoom, and target devices. See [ACCESSIBILITY_REPORT.md](ACCESSIBILITY_REPORT.md).

## Project layout

- `src/main.jsx` — routing with an eager home route and lazy secondary routes
- `src/components/` — layout, chat, forms, settings, shared UI
- `src/glass-interactions.css` — blue glass header, process cards, Commercial hero colors, and shared text/icon interactions
- `src/pages/` — homepage, services, and informational pages
- `src/data/site.js` — service content and demo business details
- `src/style.css`, `src/refinement.css`, `src/features.css`, `src/motion.css`, `src/hero.css`, `src/banner.css`, `src/interactions.css`, `src/floating.css`, `src/polish.css`, `src/outro.css`, and `src/wet-paint.css` — layout, motion, full-width banners, the floating header, the shared CTA/footer photo, and wet-paint interactions
- `public/assets/images/enhanced/` — enhanced site images; see [IMAGE_ENHANCEMENT.md](IMAGE_ENHANCEMENT.md)

Performance targets in the brief (LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms) require measurement on the final host and representative devices; this repository does not claim those results.

A local production preview check is available with `npm run build`, `npm run preview -- --port 4174`, and `node scripts/performance-check.mjs`. It records LCP, CLS, and sampled interaction event durations at 375 and 1440 pixels. These loopback results are diagnostic; they are not field Core Web Vitals or a valid INP assessment.

The latest loopback measurements are saved in `reports/local-performance.json`; the final host and real devices still need testing.

Page titles and descriptions update on client-side navigation. Static social crawlers may need prerendered or server-rendered route content and metadata on the final host.

Vercel uses vercel.json to serve SPA routes from index.html while leaving asset requests outside the route fallback. Live auditing found direct-route 404s, but all 23 image URLs and client-navigated pages loaded their images. Image failures retry their original source once; persistent failures retain alt text.
