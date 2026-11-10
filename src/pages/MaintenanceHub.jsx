import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '../components/Shared.jsx';
import AnimatedIcon from '../components/AnimatedIcon.jsx';
import useReveal from '../hooks/useReveal.js';

const topics = [
  { title: 'Watch for leaks', icon: 'droplets', text: 'Look under sinks and around fixtures for moisture. Compare water bills over time; a sudden change may be a clue that warrants a closer look.', service: '/services/leak-repair', source: 'EPA WaterSense', url: 'https://www.epa.gov/watersense/home-maintenance' },
  { title: 'Protect pipes in cold weather', icon: 'pipe', text: 'Pay attention to pipes in exterior walls and other cold spaces. Follow local weather guidance and ask a professional about protecting exposed lines.', service: '/services/pipe-repair', source: 'National Weather Service', url: 'https://www.weather.gov/safety/cold-after' },
  { title: 'Keep drains clear', icon: 'waves', text: 'Keep cooking grease out of sink drains. A recurring slow drain deserves a closer look.', service: '/services/drain-cleaning', source: 'Seattle Public Utilities', url: 'https://seattle.gov/utilities/protecting-our-environment/sustainability-tips/fats-oils-and-grease-%28fog%29' },
  { title: 'Check the water heater', icon: 'thermometer', text: 'Look for visible moisture or unusual changes in hot water. Follow the equipment manual and arrange professional service when maintenance is due.', service: '/services/water-heaters', source: 'EPA WaterSense checklist', url: 'https://www.epa.gov/system/files/documents/2024-03/watersense_homemaintenancechecklist_508.pdf' },
  { title: 'Notice warning signs', icon: 'gauge', text: 'Recurring clogs, running toilets, damp surfaces, or a lasting pressure change deserve attention. A professional can assess the cause.', service: '/problem-finder', source: 'EPA WaterSense', url: 'https://www.epa.gov/watersense/home-maintenance' },
  { title: 'Plan for an urgent event', icon: 'siren', text: 'Know where the main water shutoff is. Stay clear of water near electrical equipment, and use qualified emergency help when conditions are unsafe.', service: '/emergency', source: 'Ready.gov flood guidance', url: 'https://www.ready.gov/sites/default/files/2024-07/ready.gov_flood_info-sheet.pdf' }
];

export default function MaintenanceHub() {
  useReveal();
  return <><PageHero variant="residential" eyebrow="PLUMBING MAINTENANCE" title="A few good habits can make problems easier to spot." text="Use this guide to notice changes early and prepare useful questions for a qualified plumber. Advice here is general and may not fit every plumbing system." imageName="hero-running-faucet" imageAlt="Water running from a household faucet"><Link className="btn btn-primary" to="/problem-finder">Explore a current problem <ArrowRight size={17} aria-hidden="true" /></Link></PageHero><section className="section"><div className="container"><div className="section-intro"><span className="eyebrow">MAINTENANCE NOTES</span><h2>Practical checks by topic</h2><p>Each note links to a related service guide and an authoritative public source.</p></div><div className="maintenance-grid">{topics.map(topic => <article className="maintenance-card" key={topic.title}><AnimatedIcon name={topic.icon} size={28} animation="lift" trigger="hover" /><h3>{topic.title}</h3><p>{topic.text}</p><div className="maintenance-links"><Link to={topic.service}>Related guidance <ArrowRight size={16} aria-hidden="true" /></Link><a href={topic.url} target="_blank" rel="noopener noreferrer">Source: {topic.source} <span className="sr-only">(opens in a new tab)</span></a></div></article>)}</div></div></section></>;
}
