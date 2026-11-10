# Image enhancement record

All 23 supplied images were reviewed alongside `Reference/Plumbing Services Website Preference.png`. The reference establishes the blue and white palette, plumbing subjects, and polished service photography. The site now uses restyled assets in `public/assets/images/enhanced/`; the supplied JPGs remain in `images/`.

## Generation method

Each image was edited separately with the built-in `image_gen__imagegen` tool using its local source image as the reference. The final prompt set asked for premium, realistic plumbing photography or clean graphic art; crisp subject detail; natural lighting; navy, cobalt, cyan, and white color continuity; and no unreadable lettering or baked service captions. Existing compositions were allowed to change. The logo was generated as a transparent mark and its business name is live HTML text.

| Assets | Prompt direction |
| --- | --- |
| `hero-plumber-van.jpg`, `hero-leak-repair.jpg`, `hero-running-faucet.jpg`, `hero-water-heater.jpg` | Restyle each hero as clear, high quality editorial photography of its original plumbing subject, with realistic tools, water, and natural light. |
| `service-leak-repair.jpg`, `service-drain-cleaning.jpg`, `service-water-heater.jpg`, `service-toilet-fixtures.jpg`, `service-pipe-repair.jpg`, `service-sump-pump.jpg` | Create full frame, subject specific service photography with no title strip, label, icon, or text baked into the image. |
| `emergency-plumbing.jpg` | Show an urgent burst pipe and red beacon without adding a `24/7` availability claim. |
| `water-wave-banner.jpg` | Create a clean blue flowing water banner suitable as a decorative background. |
| `company-service-van.jpg`, `plumbing-team.jpg`, `residential-home.jpg`, `commercial-building.jpg`, `commercial-pipe-system.jpg` | Polish the van, team, residential, commercial, and equipment photography while keeping their subjects recognizable and avoiding fabricated written claims. |
| `customer-support.jpg` | Create a warm, realistic customer support portrait with clear facial detail. |
| `ai-chatbot.jpg` | Create a friendly, refined blue and white 3D chatbot illustration without words. |
| `booking-process.jpg` | Show a four step calendar, tools, gear, and check sequence using icons and arrows, without words or numbers. |
| `trust-icons.jpg` | Use neutral house, building, speech, and wrench symbols instead of unverified credential, price, or guarantee claims. |
| `company-logo.png` | Create a transparent blue, cyan, and navy water droplet mark with no embedded lettering. |
| `accessibility-badge.jpg` | Use a neutral accessibility symbol without ADA or WCAG certification wording. |

The generated JPEGs were saved at quality 88. `company-logo.png` retains transparency. The site uses CSS crops and live text for headings and service names.
