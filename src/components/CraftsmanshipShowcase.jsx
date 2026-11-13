import React, { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { craftsmanship } from '../data/craftsmanship.js';
import PlumbingFlowIllustration from './PlumbingFlowIllustration.jsx';

export function HotspotImage({ src, alt, hotspots, width = 1200, height = 800 }) {
  const [active, setActive] = useState(null);
  const [failed, setFailed] = useState(false);
  const buttonRefs = useRef({});
  const id = useId();
  if (failed) return <p className="craft-asset-note">This photograph is unavailable. Its annotations have been hidden until the asset is restored.</p>;
  return <div className="hotspot-feature" onKeyDown={event => { if (event.key === 'Escape' && active !== null) { setActive(null); buttonRefs.current[active]?.focus(); } }}>
    <div className="hotspot-image"><img src={src} alt={alt} width={width} height={height} loading="lazy" onError={() => setFailed(true)} />{hotspots.map((spot, index) => <button key={spot.id} ref={element => { buttonRefs.current[index] = element; }} className={`hotspot ${active === index ? 'is-active' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} type="button" aria-label={`About ${spot.title}`} aria-expanded={active === index} aria-controls={`${id}-panel`} onClick={() => setActive(active === index ? null : index)}>{index + 1}</button>)}</div>
    <div id={`${id}-panel`} className="hotspot-panel" aria-live="polite">{active !== null ? <><h4>{hotspots[active].title}</h4><p>{hotspots[active].text}</p><button type="button" className="text-link" onClick={() => { const previous = active; setActive(null); buttonRefs.current[previous]?.focus(); }}>Close explanation</button></> : <p>Select a numbered detail to read its explanation.</p>}</div>
  </div>;
}

export default function CraftsmanshipShowcase() {
  const [selected, setSelected] = useState(craftsmanship[0].id);
  const current = craftsmanship.find(item => item.id === selected);
  return <section className="section craftsmanship" aria-labelledby="craft-title"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">TOOLS, MATERIALS & DETAILS</span><h2 id="craft-title">Craftsmanship Behind Every Connection</h2><p>Explore the considerations behind professional plumbing work. These educational examples are not verified company practices.</p></div></div>
    <div className="craft-categories" aria-label="Craftsmanship topics">{craftsmanship.map(item => <button className={item.id === selected ? 'is-active' : ''} type="button" aria-pressed={item.id === selected} key={item.id} onClick={() => setSelected(item.id)}>{item.title}</button>)}</div>
    <div className="craft-editorial"><div className="craft-visual" key={selected}>{current.image ? <HotspotImage src={current.image} alt={current.imageAlt} hotspots={current.hotspots} /> : <><PlumbingFlowIllustration type={current.diagram} /><p className="craft-asset-note">Company photography pending. This schematic is illustrative; approved photographs and verified annotations will replace it.</p></>}</div><div className="craft-copy"><span className="eyebrow">{String(craftsmanship.indexOf(current) + 1).padStart(2, '0')} / FIELD NOTES</span><h3>{current.title}</h3><p>{current.text}</p><Link className="text-link" to={current.href}>{current.link} →</Link><Link className="text-link" to="/projects">View project content status →</Link></div></div>
  </div></section>;
}
