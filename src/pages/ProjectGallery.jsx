import BeforeAfterSlider from '../components/BeforeAfterSlider.jsx';
import { featuredComparison } from '../data/projectComparisons.js';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { image } from '../data/site.js';
import { PageHero } from '../components/Shared.jsx';
import useReveal from '../hooks/useReveal.js';

const examples = [
  { title: 'Kitchen pipe access', category: 'Residential', image: 'service-leak-repair', alt: 'Plumber working below a kitchen sink', text: 'An illustration of the type of repair photo a verified project story might include.' },
  { title: 'Drain service setup', category: 'Residential', image: 'service-drain-cleaning', alt: 'Plumber using a drain cable below a sink', text: 'An example service scene, not a documented customer project.' },
  { title: 'Water heater equipment', category: 'Residential', image: 'service-water-heater', alt: 'Residential water heater and supply pipes', text: 'Equipment photography shown for layout demonstration only.' },
  { title: 'Commercial pipe room', category: 'Commercial', image: 'commercial-pipe-system', alt: 'Commercial plumbing pipes and valves', text: 'A sample commercial image, with no project outcome claim.' }
];

export default function ProjectGallery() {
  useReveal();
  const [category, setCategory] = useState('All');
  const [hasFiltered, setHasFiltered] = useState(false);
  const visible = category === 'All' ? examples : examples.filter(item => item.category === category);
  function selectCategory(next) {
    if (next === category) return;
    setCategory(next);
    setHasFiltered(true);
  }

  return <>
    <PageHero variant="document" eyebrow="PROJECT GALLERY" title="The work is best shown with real projects." text="This gallery demonstrates the intended layout using illustrative plumbing images. It does not present these images as actual customer jobs or before-and-after results." />
    <section className="section"><div className="container">
      <div className="gallery-notice"><strong>Verified photo pairs needed</strong><p>Before-and-after comparisons will be added when the business provides genuine, permission-cleared photos of the same project and accurate descriptions.</p></div>
      <div className="gallery-filter" role="group" aria-label="Filter gallery category">
        {['All', 'Residential', 'Commercial'].map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => selectCategory(item)}>{item}</button>)}
      </div>
      <p className="sr-only" role="status">Showing {visible.length} illustrative {visible.length === 1 ? 'image' : 'images'}.</p>
      <div className="gallery-grid" key={category} data-filtered={hasFiltered ? 'true' : undefined}>
        {visible.map(item => <article className="gallery-card" key={item.title}><img src={image(item.image)} alt={item.alt} width="640" height="410" loading="lazy" decoding="async" /><div><span className="eyebrow">ILLUSTRATIVE · {item.category}</span><h2>{item.title}</h2><p>{item.text}</p></div></article>)}
      </div>
      <div className="gallery-next"><h2>Have a plumbing question?</h2><p>Explore the service guide or prepare a request with the details you already know.</p><Link className="text-link" to="/services">Browse services <ArrowRight size={17} aria-hidden="true" /></Link></div>
    </div></section>
  <section className="section"><div className="container"><BeforeAfterSlider {...(featuredComparison || {})} /></div></section></>;
}
