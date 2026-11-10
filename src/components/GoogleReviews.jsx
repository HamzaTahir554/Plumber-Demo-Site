import React from 'react';
import { ExternalLink, MessageSquareQuote, Star } from 'lucide-react';
import { developmentReviewSamples, googleReviewProfileUrl, verifiedGoogleReviews } from '../data/reviews.js';

function Rating({ value }) {
  const rating = Math.max(1, Math.min(5, Number(value)));
  return <span className="review-rating" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} aria-hidden="true" fill={index < rating ? 'currentColor' : 'none'} />)}
  </span>;
}

export default function GoogleReviews({ preview = false }) {
  const Heading = preview ? 'h3' : 'h2';
  const SampleHeading = preview ? 'h4' : 'h3';
  if (verifiedGoogleReviews.length) {
    const reviews = preview ? verifiedGoogleReviews.slice(0, 2) : verifiedGoogleReviews;
    return <div className="google-reviews">
      <div className="review-source"><strong>Google Reviews</strong>{googleReviewProfileUrl && <a href={googleReviewProfileUrl} target="_blank" rel="noopener noreferrer">View business profile <ExternalLink size={15} aria-hidden="true" /></a>}</div>
      <div className="review-card-grid">{reviews.map(review => <article className="review-card" key={review.id}>
        <Rating value={review.rating} />
        <blockquote><p>{review.text}</p></blockquote>
        <div className="review-meta"><strong>{review.displayName}</strong><time dateTime={review.date}>{new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(review.date))}</time></div>
        {(review.reviewUrl || googleReviewProfileUrl) && <a className="review-source-link" href={review.reviewUrl || googleReviewProfileUrl} target="_blank" rel="noopener noreferrer">View on Google <ExternalLink size={14} aria-hidden="true" /></a>}
      </article>)}</div>
    </div>;
  }

  return <div className="google-reviews google-reviews--empty">
    <div className="review-empty-note"><MessageSquareQuote size={24} aria-hidden="true" /><div><Heading>Verified reviews are coming.</Heading><p>This demo is waiting for the business’s real Google review source. No customer rating or testimonial is claimed here.</p></div></div>
    {import.meta.env.DEV && <div className="review-card-grid review-card-grid--samples" aria-label="Development-only review layout examples">
      {developmentReviewSamples.map(sample => <article className="review-card review-card--sample" key={sample.id}>
        <span className="review-sample-label">Design sample · Not a customer review</span>
        <SampleHeading>{sample.title}</SampleHeading><p>{sample.text}</p>
      </article>)}
    </div>}
  </div>;
}
