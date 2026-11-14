import { homeFaqs, services } from './site.js';

export const faqItems = [
  { q: 'How can I track my service request?', a: 'Open Track Request and enter the reference and email used for your test request. With the local demo server running, verify access using the one-time code in the operator’s local test inbox. The hosted demo has no connected tracking service.', category: 'Request tracking', href: '/track-request', linkText: 'Track a test request' },
  { q: 'Where can I find my request reference?', a: 'After a test request is successfully saved by the local server, its confirmation screen displays a reference and a Copy Reference button. Finishing an unconnected demo review does not create a request or reference.', category: 'Request tracking' },
  { q: 'What does Under Review mean?', a: 'It means an authorized staff user has marked the saved request for review. Statuses change only when staff save an update; they never advance automatically.', category: 'Request tracking' },
  { q: 'How will I know when my appointment is scheduled?', a: 'Refresh your verified tracker, or enable its 30-second refresh option. A staff-recorded appointment appears with the saved date and time. All appointments in this local demonstration are fictional; no notification emails or real visits are arranged.', category: 'Request tracking' },
  { q: 'What should I do if I cannot access my request?', a: 'Check your reference and request email, then obtain a new verification code. Codes expire after 10 minutes. Too many attempts require a waiting period. The demo operator can check the local test inbox and server; support details on this site remain placeholders.', category: 'Request tracking', href: '/track-request', linkText: 'Open the tracker' },
  ...homeFaqs.map((item, index) => ({ ...item, category: index === 1 ? 'Emergency plumbing' : 'Service requests', href: index === 1 ? '/emergency' : '/contact#booking-wizard', linkText: index === 1 ? 'Emergency guidance' : 'Prepare a request' })),
  ...services.flatMap(service => service.faqs.map(item => ({ ...item, category: service.title, href: `/services/${service.slug}`, linkText: `Explore ${service.title.toLowerCase()}` })))
];
