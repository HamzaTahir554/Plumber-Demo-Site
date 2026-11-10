import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { serviceAreaZipCodes } from '../data/site.js';

export const isValidZip = value => /^\d{5}(?:-\d{4})?$/.test(value.trim());

export function getZipResult(value) {
  const zip = value.trim();
  if (!isValidZip(zip)) return { type: 'error', text: 'Enter a five-digit U.S. ZIP code, optionally followed by four digits.' };
  if (!serviceAreaZipCodes.length) return { type: 'unknown', text: 'The ZIP format is valid. Service coverage has not been provided yet; contact the business to confirm availability.' };
  if (serviceAreaZipCodes.includes(zip.slice(0, 5))) return { type: 'listed', text: 'This ZIP is on the provided service-area list. Availability still needs confirmation before an appointment can be booked.' };
  return { type: 'unknown', text: 'This ZIP is not on the provided list. Contact the business to ask about coverage.' };
}

export default function ZipCodeChecker({ value, onChange, compact = false }) {
  const [localZip, setLocalZip] = useState('');
  const [result, setResult] = useState(null);
  const controlled = value !== undefined;
  const zip = controlled ? value : localZip;
  function update(next) { (controlled ? onChange : setLocalZip)(next); setResult(null); }
  return <div className={`zip-checker ${compact ? 'zip-checker--compact' : ''}`}>
    <label htmlFor={compact ? 'booking-zip' : 'service-area-zip'}>U.S. ZIP code</label>
    <div className="zip-checker-row"><input id={compact ? 'booking-zip' : 'service-area-zip'} inputMode="numeric" autoComplete="postal-code" maxLength="10" value={zip} onChange={event => update(event.target.value)} placeholder="12345" aria-invalid={result?.type === 'error'} aria-describedby={result ? `${compact ? 'booking' : 'service-area'}-zip-result` : undefined} /><button type="button" className="btn btn-outline" onClick={() => setResult(getZipResult(zip))}>Check ZIP</button></div>
    {result && <p className={`zip-result zip-result--${result.type}`} id={`${compact ? 'booking' : 'service-area'}-zip-result`} role="status">{result.text} {result.type === 'unknown' && !compact && <Link to="/contact">Contact options</Link>}</p>}
  </div>;
}
