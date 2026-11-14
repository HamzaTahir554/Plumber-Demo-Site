import React, { useState } from 'react';
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import WetPaintButton from './WetPaintButton.jsx';

export default function RequestConfirmation({ result }) {
  const [copy, setCopy] = useState('');
  return <div className="request-confirmation" role="status"><CheckCircle2 size={36} aria-hidden="true" /><span className="eyebrow">LOCAL DEMO · SAVED</span><h2>Your test service request has been received</h2><p>Your test request is saved in the local database. Keep your reference to check its progress. No real appointment was booked and no confirmation email was sent.</p><strong className="request-reference">{result.reference}</strong><div className="request-actions"><button className="btn btn-outline" type="button" onClick={async () => { try { await navigator.clipboard.writeText(result.reference); setCopy('Reference copied.'); } catch { setCopy('Select and copy the reference above.'); } }}><Copy size={16} aria-hidden="true" />Copy reference</button><WetPaintButton to={`/track-request?reference=${encodeURIComponent(result.reference)}`} className="btn btn-primary green-action">Track request<ArrowRight size={16} aria-hidden="true" /></WetPaintButton><WetPaintButton to="/" className="btn btn-outline">Return home</WetPaintButton></div><p>{copy}</p></div>;
}
