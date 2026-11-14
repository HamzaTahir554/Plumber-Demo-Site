import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHero, RequestCta, ServiceGrid } from '../components/Shared.jsx';
import useReveal from '../hooks/useReveal.js';

export default function Services() {
  useReveal();
  return <><PageHero variant="services" eyebrow="PLUMBING SERVICES" title="Find the right service for the problem." text="Explore ten common plumbing needs, from everyday fixtures to urgent pipe concerns. Each guide explains what to look for and what to ask." imageName="hero-leak-repair" imageAlt="Plumber repairing a pipe below a sink"><Link className="btn btn-primary" to="/contact">Prepare a request <ArrowRight size={17} aria-hidden="true" /></Link></PageHero><section className="section"><div className="container"><div className="section-intro"><h2>Explore all ten services</h2><p>Choose a category to review common signs and prepare for a professional assessment.</p></div><div className="reveal"><ServiceGrid /></div></div></section><RequestCta /></>;
}
