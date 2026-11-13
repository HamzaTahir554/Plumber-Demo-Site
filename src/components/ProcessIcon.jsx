import React from 'react';
const paths = {
  message: <><path d="M4 5h16v11H9l-5 4Z" /><path className="process-icon-detail" d="M8 9h8M8 12h5" /></>,
  wrench: <><path d="M17 3a5 5 0 0 0-6 6L4 16a2 2 0 0 0 4 4l7-7a5 5 0 0 0 6-6l-4 3-3-3Z" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /><path className="process-icon-detail" d="m8 15 3 3 5-5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path className="process-icon-detail" d="m7 12 3 3 7-7" /></>
};
export default function ProcessIcon({ name }) { return <span className="animated-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>; }
