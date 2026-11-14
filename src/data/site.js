export const brand = 'Company name';
export const phone = '555-123-4567';
// Supply a verified E.164 business number before enabling mobile tel: action.
export const verifiedPhone = null;
export const email = 'hello@example.com';
// Populate only after the business supplies and verifies its coverage list.
export const serviceAreaZipCodes = [];
export const image = (name) => `/assets/images/enhanced/${name}.${name === 'company-logo' ? 'png' : 'jpg'}`;

export { services } from './serviceCatalog.js';

export const homeFaqs = [
  { q: 'How do I request a visit?', a: 'Use the five-step demo request form with fictional details. When the local request server is running, you can save and track a test request. Otherwise, the form only reviews your entries. No real visit is booked.' },
  { q: 'Do you offer emergency plumbing?', a: 'The emergency page describes urgent plumbing situations. Actual emergency availability and a real dispatch number must be confirmed by the business before launch.' },
  { q: 'Can you help with homes and businesses?', a: 'This site presents both residential and commercial service categories. Confirm the company’s actual service scope and coverage before publication.' },
  { q: 'Can I get a quote online?', a: 'The demo form can help prepare fictional details and, with the local request server connected, save a test request. It does not produce a real quote.' }
];

export const servicePreparation = {
  'leak-repair': ['Where moisture first appeared', 'Whether the leak is active or intermittent', 'The location of any accessible shutoff valve'],
  'drain-cleaning': ['Which fixtures drain slowly', 'When the blockage began', 'Whether more than one drain is affected'],
  'water-heaters': ['The heater type and approximate age if known', 'Changes in temperature, noise, or visible moisture', 'Whether the problem affects one fixture or the whole property'],
  'toilet-fixture-repair': ['The affected fixture and its symptoms', 'Whether water is leaking, running, or flowing weakly', 'Any replacement style or accessibility needs'],
  'pipe-repair': ['The location of visible damage', 'Changes in water pressure or color', 'Whether water has been shut off safely'],
  'sump-pumps': ['Whether the pump starts and stops', 'Any unusual noise or rising water', 'When the unit was last checked']
};
