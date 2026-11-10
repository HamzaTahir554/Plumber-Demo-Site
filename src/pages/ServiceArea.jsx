import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ZipCodeChecker from '../components/ZipCodeChecker.jsx';
import AnimatedIcon from '../components/AnimatedIcon.jsx';
import { PageHero } from '../components/Shared.jsx';
import useReveal from '../hooks/useReveal.js';

export default function ServiceArea() {
  useReveal();
  return <><PageHero variant="service-area" eyebrow="SERVICE AREA" title="Check a ZIP code before planning a visit." text="The checker validates U.S. ZIP code format. The business has not provided a verified coverage list, so availability cannot be confirmed here." imageName="company-service-van" imageAlt="Plumbing service van" position="center center" mobilePosition="57% center" /><section className="section"><div className="container service-area-layout"><div><h2>Enter a ZIP code</h2><p>Use the result as a starting point for a conversation, not as a booking confirmation.</p><ZipCodeChecker /></div><aside className="tool-aside"><AnimatedIcon name="mapPin" size={32} animation="none" /><h2>Coverage information pending</h2><p>Service locations, travel limits, hours, and emergency availability need to be supplied by the business before launch.</p><Link to="/contact">Prepare an inquiry <ArrowRight size={16} aria-hidden="true" /></Link></aside></div></section></>;
}
