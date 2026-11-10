import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { services, servicePreparation } from '../data/site.js';
import { CheckList, FaqList, PageHero, RequestCta } from '../components/Shared.jsx';
import useReveal from '../hooks/useReveal.js';

const serviceImageAlt = {
  'leak-repair': 'Plumber repairing a leaking pipe below a sink',
  'drain-cleaning': 'Plumber using a drain cable below a kitchen sink',
  'water-heaters': 'Technician working on a residential water heater',
  'toilet-fixture-repair': 'Modern bathroom toilet and fixtures',
  'pipe-repair': 'Technician tightening a pipe connection below a sink',
  'sump-pumps': 'Sump pump installed in a basement pit'
};
const heroLayout = {
  'leak-repair': { position: '47% top', mobilePosition: '41% center' },
  'drain-cleaning': { position: '59% top', mobilePosition: '56% center' },
  'water-heaters': { position: '48% top', mobilePosition: '37% center' },
  'toilet-fixture-repair': { position: 'center top', mobilePosition: '50% center' },
  'pipe-repair': { position: '58% center', mobilePosition: '64% center' },
  'sump-pumps': { position: '55% center', mobilePosition: '56% center' }
};

export default function ServiceDetail() {
  useReveal();
  const { slug } = useParams();
  const service = services.find(s => s.slug === slug);
  const serviceIndex = services.findIndex(s => s.slug === slug);
  if (!service) return <PageHero variant="document" eyebrow="SERVICE NOT FOUND" title="Service page not found" text="That service is not listed."><Link className="btn btn-primary" to="/services">Browse all services <ArrowRight size={17} aria-hidden="true" /></Link></PageHero>;
  return <>
    <PageHero variant="service-detail" eyebrow={<>PLUMBING SERVICE <span className="detail-number">/ 0{serviceIndex + 1}</span></>} title={service.title} text={service.intro} imageName={service.hero || service.image} imageAlt={serviceImageAlt[service.slug]} prelude={<Link className="back-link" to="/services"><ArrowLeft size={17} aria-hidden="true" /> All services</Link>} {...heroLayout[service.slug]}><Link className="btn btn-primary" to={`/contact?service=${service.slug}`}>Prepare a request <ArrowRight size={17} aria-hidden="true" /></Link></PageHero>
    <section className="section"><div className="container detail-content"><div className="reveal"><span className="eyebrow">COMMON SIGNS</span><h2>When to look into this service</h2><p>These signs can have several causes. A qualified professional can assess the system and recommend the right work.</p><CheckList items={service.problems} /></div><div className="detail-panel reveal"><span className="eyebrow">WHAT TO EXPECT</span><h2>A useful service conversation</h2><p>Discuss the symptoms, access to the affected area, and the options that fit your plumbing system.</p><CheckList items={service.benefits} /></div></div></section>
    <section className="section detail-prepare"><div className="container detail-prepare-grid"><div><span className="eyebrow">BEFORE YOU REACH OUT</span><h2>Details worth having ready</h2><p>You do not need a diagnosis. A few observations can make the first conversation more useful.</p></div><CheckList items={servicePreparation[service.slug]} /></div></section>
    <section className="section faq-section"><div className="container faq-grid"><div><span className="eyebrow">SERVICE FAQ</span><h2>Questions about {service.title.toLowerCase()}</h2><p>General guidance to help you prepare for a professional assessment.</p></div><FaqList items={service.faqs} /></div></section><RequestCta title={`Need help with ${service.title.toLowerCase()}?`} />
  </>;
}
