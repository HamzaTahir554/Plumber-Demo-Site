import FAQSection from '../components/FAQSection.jsx';
import { faqItems } from '../data/faqs.js';
import React, { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import WetPaintButton from '../components/WetPaintButton.jsx';
import AnimatedIcon from '../components/AnimatedIcon.jsx';
import { PageHero } from '../components/Shared.jsx';
import useReveal from '../hooks/useReveal.js';

import { problems } from '../data/problems.js';


export default function ProblemFinder() {
  useReveal();
  const [params] = useSearchParams();
  const preset = problems.find(item => item.id === params.get('problem'));
  const [step, setStep] = useState(preset ? 1 : 0);
  const [problemId, setProblemId] = useState(preset?.id || '');
  const [answer, setAnswer] = useState('');
  const [risk, setRisk] = useState('none');
  const [notes, setNotes] = useState('');
  const [shareNotes, setShareNotes] = useState(false);
  const [error, setError] = useState('');
  const heading = useRef(null);
  const choice = problems.find(item => item.id === problemId);
  const urgent = risk !== 'none';
  function move(next) { setStep(next); setError(''); window.setTimeout(() => heading.current?.focus(), 0); }
  function next() {
    if (step === 0 && !problemId) { setError('Choose the issue that is closest to yours.'); return; }
    if (step === 1 && !answer) { setError('Choose an answer to continue.'); return; }
    move(step + 1);
  }
  const query = new URLSearchParams();
  if (choice?.service) query.set('service', choice.service);
  if (shareNotes && notes.trim()) query.set('issue', notes.trim());
  const requestUrl = `/contact${query.size ? `?${query}` : ''}#booking-wizard`;
  const quoteQuery = new URLSearchParams(query);
  quoteQuery.set('intent', 'quote');
  const quoteUrl = `/contact?${quoteQuery}#booking-wizard`;
  return <>
    <PageHero variant="finder" eyebrow="FIND THE RIGHT STARTING POINT" title="What plumbing problem are you seeing?" text="Answer two short questions for a possible service match. This guide cannot diagnose the issue or dispatch help." imageName="hero-leak-repair" imageAlt="Plumber working on a leaking pipe" position="42% center" mobilePosition="40% center" />
    <section className="section finder-section"><div className="container tool-layout"><div className="tool-main">
      <p className="finder-urgent">Suspected gas leak? Leave the area, avoid electrical switches or equipment, and contact your gas emergency service from a safe location. <Link to="/emergency">Emergency safety guidance</Link></p><nav className="step-progress" aria-label="Problem finder progress"><span className={step === 0 ? 'current' : ''} aria-current={step === 0 ? 'step' : undefined}>1. Issue</span><span className={step === 1 ? 'current' : ''} aria-current={step === 1 ? 'step' : undefined}>2. Details</span><span className={step === 2 ? 'current' : ''} aria-current={step === 2 ? 'step' : undefined}>3. Guidance</span></nav>
      {step === 0 && <div className="tool-step"><h2 ref={heading} tabIndex="-1">Choose the closest issue</h2><p>You can change your answer before viewing the guidance.</p><div className="problem-choice-grid">{problems.map(problem => <label className={`problem-choice ${problemId === problem.id ? 'is-selected' : ''}`} key={problem.id}><input type="radio" name="problem" value={problem.id} checked={problemId === problem.id} onChange={() => { setProblemId(problem.id); setAnswer(''); setError(''); }} /><AnimatedIcon name={problem.icon} size={25} animation="lift" trigger="hover" /><span>{problem.title}</span><Check className="problem-choice-check" size={19} aria-hidden="true" /></label>)}</div></div>}
      {step === 1 && <div className="tool-step"><h2 ref={heading} tabIndex="-1">A little more detail</h2><fieldset className="choice-fieldset"><legend>{choice.question}</legend>{choice.choices.map(option => <label key={option}><input type="radio" name="detail" value={option} checked={answer === option} onChange={() => { setAnswer(option); setError(''); }} />{option}</label>)}</fieldset><fieldset className="choice-fieldset"><legend>Is there an immediate safety concern?</legend><label><input type="radio" name="risk" checked={risk === 'none'} onChange={() => setRisk('none')} />No immediate hazard noticed</label><label><input type="radio" name="risk" checked={risk === 'active-water'} onChange={() => setRisk('active-water')} />Active flooding or water rising</label><label><input type="radio" name="risk" checked={risk === 'electrical'} onChange={() => setRisk('electrical')} />Water near electrical equipment</label><label><input type="radio" name="risk" checked={risk === 'gas'} onChange={() => setRisk('gas')} />Possible gas leak</label></fieldset><label className="finder-notes" htmlFor="finder-notes">Optional details in your own words<textarea id="finder-notes" rows="3" value={notes} maxLength="500" onChange={event => setNotes(event.target.value)} placeholder="For example: water is dripping below the kitchen sink." /></label></div>}
      {step === 2 && <div className="tool-step finder-result"><h2 ref={heading} tabIndex="-1">Your suggested next step</h2>{urgent && <div className="finder-urgent" role="alert"><AnimatedIcon name="siren" size={25} animation="none" /><div><strong>Prioritize safety first.</strong><p>{risk === 'gas' ? 'Leave the area and contact your gas utility or local emergency services from a safe place.' : risk === 'electrical' ? 'Stay clear of water near electrical equipment and seek qualified help from a safe location.' : 'If safe, shut off the water supply and contact a qualified local emergency plumber.'}</p><Link to="/emergency">Read emergency guidance <ArrowRight size={16} aria-hidden="true" /></Link></div></div>}<div className="finder-recommendation"><span className="eyebrow">POSSIBLE SERVICE MATCH</span><h3>{choice.serviceTitle}</h3><p>{choice.service ? `Based on “${choice.title.toLowerCase()}” and “${answer.toLowerCase()},” this service is a reasonable starting point. A qualified professional should assess the actual cause.` : 'The available answers do not point clearly to one service. Review the service list or describe the issue in a contact request.'}</p>{choice.service && <Link className="text-link" to={`/services/${choice.service}`}>Read about this service <ArrowRight size={16} aria-hidden="true" /></Link>}</div>{choice.service && <div className="finder-faq"><h3>Related questions</h3><FAQSection searchable={false} items={faqItems.filter(item => item.href === `/services/${choice.service}`)} /></div>}<label className="finder-consent"><input type="checkbox" checked={shareNotes} onChange={event => setShareNotes(event.target.checked)} disabled={!notes.trim()} />Include my optional notes in the demo request form</label><div className="finder-actions"><WetPaintButton className="btn btn-primary green-action" to={requestUrl}>Prepare a service request <ArrowRight size={17} aria-hidden="true" /></WetPaintButton><WetPaintButton className="btn btn-primary green-action" to="/contact#contact-details">Call Now ? demo contact</WetPaintButton><Link className="btn btn-outline" to={quoteUrl}>Request a quote</Link><button type="button" className="btn btn-outline" onClick={() => window.dispatchEvent(new Event('plumbing:open-chat'))}>Ask the demo guide</button><Link className="text-link" to="/emergency">Emergency guidance</Link></div><p className="small-note">The form and chat are demos. Local test requests can be saved when the demo server is connected. No real quote or emergency dispatch is available.</p></div>}
      {error && <p className="tool-error" role="alert">{error}</p>}
      {step < 2 && <div className="wizard-actions">{step > 0 && <button type="button" className="btn btn-outline" onClick={() => move(step - 1)}><ArrowLeft size={17} aria-hidden="true" /> Back</button>}<button type="button" className="btn btn-primary" onClick={next}>Continue <ArrowRight size={17} aria-hidden="true" /></button></div>}{step === 2 && <button type="button" className="text-link finder-start-over" onClick={() => move(0)}>Start over</button>}
    </div><aside className="tool-aside"><AnimatedIcon name="clipboard" size={32} animation="none" /><h2>How this guide works</h2><p>Each issue maps to a related service page. Your answers help narrow the starting point; they do not confirm a diagnosis, price, availability, or coverage.</p><Link to="/services">Browse all services <ArrowRight size={16} aria-hidden="true" /></Link></aside></div></section>
  </>;
}
