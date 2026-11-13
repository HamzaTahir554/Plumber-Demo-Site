# Project comparison content

The homepage and Projects page reuse `BeforeAfterSlider`. Until approved photos are supplied, both show an explicit empty state. Existing illustrative plumbing assets are deliberately not used as project evidence.

To publish a comparison, add optimized assets to `public/assets/images/projects/`, then set `featuredComparison` in `src/data/projectComparisons.js`:

```js
export const featuredComparison = {
  before: { src: '/assets/images/projects/project-before.webp', alt: 'Accurate description of the documented condition before work' },
  after: { src: '/assets/images/projects/project-after.webp', alt: 'Accurate description of the documented condition after work' },
  description: 'Approved factual description of this project.'
};
```

Required: the same actual project, matching framing/viewpoint, equal image dimensions (prefer 1200×800), publication permission, accurate alt text and approved description. Remove private customer/location details. Filenames are case-sensitive in production. The component uses a stable 3:2 frame and matching object-fit crops. Review alignment before publication. Missing/failed assets show the empty state rather than a misleading comparison.

The isolated test fixture uses plain color swatches to exercise pointer/touch/keyboard behavior. Vite's production entry does not include that fixture or any synthetic project pair.

# Request and coverage integration

There is no booking, dispatch, email or availability backend in this project. The existing demo workflow remains local React state. Finishing the review does not transmit data, confirm a time, reserve a slot or store a request. Existing date/contact validation and Back/Edit preservation remain active. Service-area data is still unverified; ZIP checks validate format only.

Before launch, supply verified contact details, business information, service coverage, real scheduling/request endpoints, and approved project/review content. Connect backend acceptance/error states only when the actual API contract is available; no fake success or network state has been introduced.

# Motion components

- `WaterRipple`: one reusable ring per surface, mouse-entry only, 900ms throttle, no pointermove listener, no hit interception.
- `LiquidSectionDivider`: two small inline paths; the waterline tracks existing page scroll progress.
- `AnimatedHeading`: words keep natural wrapping; measured row positions assign a shared delay per visual line. A ResizeObserver updates line grouping. Accessible heading text remains a single name.
- `PlumbingFlowIllustration`: original schematic pipe/leak/drain/heater variants; explicit Play action runs a finite sequence. Static captions convey meaning with motion disabled.
- `ProcessIcon`: original step SVGs sharing existing stroke weight, color and parent interaction rules.
- `BeforeAfterSlider`: native named range, pointer capture, keyboard controls, touch pan-y behavior, reset, stable dimensions and asset-failure state.

Existing `useReveal`, `useScrollMotion`, wet-paint buttons and the shared hero/footer structure remain in use. No new runtime dependencies were added.

# Craftsmanship photographs and annotations

The About page's `CraftsmanshipShowcase` reads `src/data/craftsmanship.js`. All four topics currently use clearly labeled educational schematics. They are not photographs of company work or verified descriptions of company procedures.

After verifying publication permission and the accompanying explanation, configure a topic with:

```js
image: '/assets/images/craftsmanship/approved-fitting.webp',
imageAlt: 'An accurate description of the approved photograph',
hotspots: [{
  id: 'fitting', x: 40, y: 60,
  title: 'Verified component name',
  text: 'Approved factual explanation of this visible component.'
}]
```

Use optimized 1200-by-800 images for the default reserved dimensions. `HotspotImage` also accepts explicit `width` and `height` for other aspect ratios; pass the actual dimensions when configuring another ratio. Images display uncropped at their native ratio, so x/y percentages stay aligned on desktop and mobile. Keep centers at least 22px from image boundaries at the narrowest supported width. Buttons support mouse, touch, Enter/Space, close, and Escape with focus return. Synthetic hotspot test imagery is excluded from the production build. Existing project comparisons are linked rather than duplicated.

# Floating mobile contact action

`verifiedPhone` in `src/data/site.js` intentionally remains null. The mobile Call Now action is labeled “Demo contact” and opens the existing contact-details section, following the previously approved demo behavior. Supply a verified international-format business number (for example, the actual E.164 value, not the sample 555 number) before enabling `tel:`. Update the displayed phone/email and other placeholder details consistently before launch.

Request Service opens `/contact#booking-wizard`, the existing five-step demo. The bar hides near heroes, final CTAs/footer, interactive tools/FAQs/comparisons/hotspots, while typing, and during navigation, chat, display settings or booking. Below 680px it uses safe-area spacing and at least 46px controls; larger layouts retain the existing page actions.
