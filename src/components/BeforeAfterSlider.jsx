import React, { useId, useRef, useState } from 'react';

export default function BeforeAfterSlider({ before, after, description, beforeLabel = 'Before', afterLabel = 'After' }) {
  const [value, setValue] = useState(50);
  const [failed, setFailed] = useState(false);
  const frame = useRef(null);
  const id = useId();
  if (!before?.src || !after?.src || failed) return <div className="comparison-empty"><span className="eyebrow">PROJECT COMPARISON</span><h3>Verified project photos coming soon</h3><p>No before-and-after project pair has been published yet. This space is reserved for approved photos of the same project, taken from comparable viewpoints.</p></div>;
  function update(event) { const box = frame.current.getBoundingClientRect(); setValue(Math.round(Math.max(0, Math.min(100, (event.clientX - box.left) / box.width * 100)))); }
  return <figure className="comparison reveal"><div className="comparison-frame" ref={frame} style={{ '--comparison': `${value}%` }}>
    <img src={after.src} alt={after.alt || 'Project after work'} width="1200" height="800" loading="lazy" onError={() => setFailed(true)} />
    <img className="comparison-before" src={before.src} alt={before.alt || 'Project before work'} width="1200" height="800" loading="lazy" onError={() => setFailed(true)} />
    <span className="comparison-label">{beforeLabel}</span><span className="comparison-label comparison-label--after">{afterLabel}</span>
    <div className="comparison-line" aria-hidden="true"><span>↔</span></div>
    <input id={id} type="range" min="0" max="100" value={value} aria-label="Before and after comparison" aria-valuetext={`${value}% before image visible`} onChange={event => setValue(Number(event.target.value))} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); update(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event); }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} />
  </div><figcaption>{description}<button type="button" className="text-link" onClick={() => setValue(50)}>Reset comparison</button></figcaption></figure>;
}
