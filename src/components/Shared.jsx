import FAQSection from './FAQSection.jsx';
import WaterRipple from './WaterRipple.jsx';
import LiquidSectionDivider from './LiquidSectionDivider.jsx';
import AnimatedHeading from './AnimatedHeading.jsx';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Phone } from 'lucide-react';
import { image, services } from '../data/site.js';
import AnimatedIcon from './AnimatedIcon.jsx';
import WetPaintButton from './WetPaintButton.jsx';

const serviceIcons = { 'leak-repair': 'droplets', 'drain-cleaning': 'waves', 'water-heaters': 'thermometer', 'toilet-fixture-repair': 'wrench', 'pipe-repair': 'pipe', 'sump-pumps': 'gauge' };
const bannerPositions = { services: '54% top', residential: 'center center', commercial: 'center 38%', emergency: 'left center', about: 'center center', contact: '35% top', reviews: 'center center', document: 'center center' };
const bannerMobilePositions = { services: '36% center', residential: '54% center', commercial: '58% center', emergency: '15% center', about: '50% center', contact: '37% center', reviews: '62% center', document: '62% center' };
// Each route keeps the shared hero layout, but gets its own restrained entrance choreography.
const heroMotionByPath = {
  '/': { name: 'rise', heading: 'translateY(18px)', body: 'translateY(12px)', photo: 'scale(1.012)', delay: '0ms' },
  '/services': { name: 'sweep-left', heading: 'translateX(-18px)', body: 'translateY(14px)', photo: 'scale(1.008)', delay: '20ms' },
  '/services/leak-repair': { name: 'sweep-right', heading: 'translateX(18px)', body: 'translateY(12px)', photo: 'scale(1.016)', delay: '35ms' },
  '/services/drain-cleaning': { name: 'lift-right', heading: 'translate(12px, 15px)', body: 'translateX(-14px)', photo: 'scale(1.01)', delay: '15ms' },
  '/services/water-heaters': { name: 'settle-down', heading: 'translateY(-18px)', body: 'translateX(14px)', photo: 'scale(1.014)', delay: '25ms' },
  '/services/toilet-fixture-repair': { name: 'lift-left', heading: 'translate(-12px, 15px)', body: 'translateX(14px)', photo: 'scale(1.006)', delay: '40ms' },
  '/services/pipe-repair': { name: 'settle-left', heading: 'translate(-14px, -12px)', body: 'translateY(15px)', photo: 'scale(1.018)', delay: '10ms' },
  '/services/sump-pumps': { name: 'settle-right', heading: 'translate(14px, -12px)', body: 'translateX(-14px)', photo: 'scale(1.012)', delay: '30ms' },
  '/problem-finder': { name: 'rise-across', heading: 'translateY(17px)', body: 'translateX(16px)', photo: 'scale(1.016)', delay: '45ms' },
  '/service-area': { name: 'sweep-settle', heading: 'translateX(-17px)', body: 'translateY(-13px)', photo: 'scale(1.01)', delay: '30ms' },
  '/projects': { name: 'sweep-drop', heading: 'translateX(17px)', body: 'translateY(-14px)', photo: 'scale(1.018)', delay: '5ms' },
  '/maintenance': { name: 'lift-settle', heading: 'translate(13px, 13px)', body: 'translateY(-15px)', photo: 'scale(1.008)', delay: '45ms' },
  '/residential': { name: 'drop-left', heading: 'translate(-13px, -14px)', body: 'translateY(13px)', photo: 'scale(1.012)', delay: '25ms' },
  '/commercial': { name: 'drop-right', heading: 'translate(13px, -14px)', body: 'translateX(-15px)', photo: 'scale(1.006)', delay: '35ms' },
  '/emergency': { name: 'lift-then-settle', heading: 'translate(-14px, 14px)', body: 'translateY(-14px)', photo: 'scale(1.016)', delay: '0ms' },
  '/about': { name: 'cross-left', heading: 'translate(15px, 11px)', body: 'translate(-12px, -9px)', photo: 'scale(1.014)', delay: '40ms' },
  '/contact': { name: 'cross-right', heading: 'translate(-15px, 11px)', body: 'translate(12px, -9px)', photo: 'scale(1.008)', delay: '15ms' },
  '/reviews': { name: 'drop-across', heading: 'translate(-12px, -15px)', body: 'translateX(15px)', photo: 'scale(1.018)', delay: '20ms' },
  '/accessibility': { name: 'drop-then-rise', heading: 'translate(12px, -15px)', body: 'translateY(14px)', photo: 'scale(1.01)', delay: '35ms' },
  '/privacy': { name: 'diagonal-cross', heading: 'translate(-15px, -11px)', body: 'translate(12px, 9px)', photo: 'scale(1.006)', delay: '50ms' }
};
const fallbackHeroMotion = { name: 'not-found', heading: 'translateY(-16px)', body: 'translateX(-12px)', photo: 'scale(1.014)', delay: '55ms' };
export function HeroBanner({ eyebrow, title, text, imageName = 'water-wave-banner', imageAlt = '', children, variant = '', position, mobilePosition, prelude, afterActions }) {
  const { pathname } = useLocation();
  const motion = heroMotionByPath[pathname.replace(/\/+$/, '') || '/'] || fallbackHeroMotion;
  const desktopPosition = position || bannerPositions[variant] || 'center top';
  return <section className={`page-hero hero-banner ${variant ? `page-hero--${variant}` : ''}`} data-hero-motion={motion.name} style={{ '--banner-position': desktopPosition, '--banner-mobile-position': mobilePosition || bannerMobilePositions[variant] || desktopPosition, '--hero-heading-from': motion.heading, '--hero-body-from': motion.body, '--hero-photo-from': motion.photo, '--hero-motion-delay': motion.delay }}>
    <img className="hero-banner-image" src={image(imageName)} width="1600" height="900" alt={imageAlt} fetchpriority="high" decoding="async" />
    <div className="container hero-banner-inner"><div className="hero-banner-copy">
      {prelude}
      <span className="eyebrow">{eyebrow}</span><AnimatedHeading>{title}</AnimatedHeading><p className="lead">{text}</p>
      {children && <WaterRipple className="hero-actions">{children}</WaterRipple>}
      {afterActions}
    </div></div>
  </section>;
}
export const PageHero = HeroBanner;
export function SectionHeading({ eyebrow, title, text, link, linkText }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{link && <Link className="text-link" to={link}>{linkText || 'Explore more'} <ArrowRight size={18} aria-hidden="true" /></Link>}</div>;
}
export function ServiceGrid({ limit }) {
  return <div className="service-grid">{services.slice(0, limit || services.length).map((service, index) => <WaterRipple as="article" className="service-card" key={service.slug}><Link className="service-card-image" to={`/services/${service.slug}`} tabIndex="-1" aria-hidden="true"><img src={image(service.image)} width="640" height="410" loading="lazy" decoding="async" alt="" /><span className="service-card-index">SERVICE / {String(index + 1).padStart(2, '0')}</span></Link><div className="service-card-body"><div className="service-card-heading"><AnimatedIcon name={serviceIcons[service.slug]} size={25} animation="lift" trigger="hover" /><h3><Link to={`/services/${service.slug}`}>{service.title}</Link></h3></div><div className="service-card-details"><p>{service.short}</p></div><Link className="card-link" to={`/services/${service.slug}`}>View details <ArrowRight size={17} aria-hidden="true" /></Link></div></WaterRipple>)}</div>;
}
export function FaqList({ items }) { return <FAQSection items={items} searchable={items.length > 3} />; }
export function CheckList({ items }) { return <ul className="check-list">{items.map(item => <li key={item}><span><Check size={16} aria-hidden="true" /></span>{item}</li>)}</ul>; }
export function RequestCta({ title = 'Ready to talk through your plumbing project?', text = 'Share the details through the demo request form, then connect a real booking service before launch.' }) {
  return <section className="request-cta"><LiquidSectionDivider subtle /><div className="container request-cta-inner"><div><span className="eyebrow">NEXT STEP</span><h2>{title}</h2><p>{text}</p></div><div className="cta-buttons"><WetPaintButton className="btn btn-white" to="/contact">Prepare a request <ArrowRight size={17} aria-hidden="true" /></WetPaintButton><Link className="btn btn-ghost" to="/emergency"><Phone size={17} aria-hidden="true" /> Emergency guidance</Link></div></div></section>;
}
