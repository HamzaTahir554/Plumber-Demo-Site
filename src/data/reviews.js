// Add only permission-cleared reviews from the business's verified Google profile.
// Each entry needs: id, displayName, rating (1–5), text, date (ISO), and reviewUrl.
export const googleReviewProfileUrl = '';
export const verifiedGoogleReviews = [];

// These layout examples appear only during local development and are not testimonials.
export const developmentReviewSamples = [
  { id: 'sample-a', title: 'Example card A', text: 'This preview shows where a verified customer’s exact review text would appear, alongside its date, rating, and source.' },
  { id: 'sample-b', title: 'Example card B', text: 'A second preview demonstrates the responsive card layout. It does not describe a real service visit or customer experience.' }
];
