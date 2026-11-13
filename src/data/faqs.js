import { homeFaqs, services } from './site.js';

export const faqItems = [
  ...homeFaqs.map((item, index) => ({ ...item, category: index === 1 ? 'Emergency plumbing' : 'Service requests', href: index === 1 ? '/emergency' : '/contact#booking-wizard', linkText: index === 1 ? 'Emergency guidance' : 'Prepare a request' })),
  ...services.flatMap(service => service.faqs.map(item => ({ ...item, category: service.title, href: `/services/${service.slug}`, linkText: `Explore ${service.title.toLowerCase()}` })))
];
