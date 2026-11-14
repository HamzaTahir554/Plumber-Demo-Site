import { canonicalService } from '../data/serviceCatalog.js';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { problems } from '../data/problems.js';
import { services } from '../data/site.js';
import { isValidZip } from './ZipCodeChecker.jsx';
import ZipCodeChecker from './ZipCodeChecker.jsx';
import AnimatedIcon from './AnimatedIcon.jsx';
import WetPaintButton from './WetPaintButton.jsx';
import RequestConfirmation from './RequestConfirmation.jsx';
import useRequestConfig from '../hooks/useRequestConfig.js';
import { post, submissionKey } from '../lib/requestApi.js';

const steps = ['Service', 'Location', 'Schedule', 'Contact', 'Review'];
const initial = { service: '', issue: '', zip: '', address: '', date: '', time: '', name: '', phone: '', email: '' };
const labels = { service: 'Service', issue: 'Issue description', zip: 'ZIP code', address: 'Service address', date: 'Preferred date', time: 'Preferred time', name: 'Full name', phone: 'Phone number', email: 'Email address' };

function validate(values, step) {
  const errors = {};
  const required = [['service'], ['zip', 'address'], ['date', 'time'], ['name', 'phone', 'email']][step] || [];
  for (const key of required) if (!values[key].trim()) errors[key] = `Enter your ${labels[key].toLowerCase()}.`;
  if (step === 0 && values.issue && values.issue.trim().length < 10) errors.issue = 'Describe the issue in at least 10 characters, or leave the field empty.';
  if (step === 1 && values.zip && !isValidZip(values.zip)) errors.zip = 'Enter a five-digit U.S. ZIP code, optionally followed by four digits.';
  if (step === 2 && values.date) {
    const selected = new Date(`${values.date}T12:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selected.getTime()) || selected < today) errors.date = 'Choose today or a future date.';
  }
  if (step === 3) {
    if (values.name && values.name.trim().length < 2) errors.name = 'Enter at least two characters for your name.';
    if (values.phone && values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a phone number with at least 10 digits.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter an email address in the format name@example.com.';
  }
  return errors;
}

export default function BookingWizard() {
  const config = useRequestConfig();
  const [saved, setSaved] = useState(null), [sending, setSending] = useState(false), [sendError, setSendError] = useState('');
  const retry = useRef(null), submitting = useRef(false);
  const [params] = useSearchParams();
  const suggested = canonicalService(params.get('service'));
  const carriedIssue = params.get('issue')?.slice(0, 500) || '';
  const intent = params.get('intent') === 'quote' ? 'quote' : 'service';
  const [values, setValues] = useState(() => ({ ...initial, service: services.some(item => item.slug === suggested) ? suggested : '', issue: carriedIssue }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [complete, setComplete] = useState(false);
  const heading = useRef(null);
  const summary = useRef(null);
  const stepDirection = useRef('forward');
  useEffect(() => {
    if (suggested && services.some(item => item.slug === suggested)) setValues(current => ({ ...current, service: suggested }));
    if (carriedIssue) setValues(current => ({ ...current, issue: carriedIssue }));
  }, [suggested, carriedIssue]);
  function set(key, value) { setValues(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })); setComplete(false); }
  function move(next) { stepDirection.current = next < step ? 'back' : 'forward'; setStep(next); setErrors({}); window.setTimeout(() => heading.current?.focus(), 0); }
  function next() {
    const found = validate(values, step);
    setErrors(found);
    if (Object.keys(found).length) { window.setTimeout(() => summary.current?.focus(), 0); return; }
    move(step + 1);
  }
  async function submitRequest() {
    if (submitting.current) return;
    if (!config.enabled) { setComplete(true); return; }
    const found = Object.assign({}, ...[0, 1, 2, 3].map(index => validate(values, index)));
    if (Object.keys(found).length) { setErrors(found); return; }
    submitting.current = true; setSending(true); setSendError('');
    try {
      const fingerprint = JSON.stringify(values);
      if (retry.current?.fingerprint !== fingerprint) retry.current = { fingerprint, key: await submissionKey(values) };
      const response = await post('/requests', values, { headers: { 'Idempotency-Key': retry.current.key } });
      setSaved(response);
    } catch (error) { setSendError(`${error.message} Your details are still here. Retrying unchanged details will not create a duplicate.`); }
    finally { submitting.current = false; setSending(false); }
  }
  const attrs = key => ({ id: `booking-${key}`, value: values[key], 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `booking-${key}-error` : undefined, onChange: event => set(key, event.target.value) });
  const field = (key, control) => <div className="field" key={key}><label htmlFor={`booking-${key}`}>{labels[key]} <span aria-hidden="true">*</span></label>{control}{errors[key] && <span className="field-error" id={`booking-${key}-error`}>{errors[key]}</span>}</div>;
  if (saved) return <div className="form-card booking-wizard" id="booking-wizard"><RequestConfirmation result={saved} /></div>;
  return <div className="form-card booking-wizard" id="booking-wizard" data-step-direction={stepDirection.current}>
    <div className="form-top"><span className="eyebrow">{intent === 'quote' ? 'QUOTE INQUIRY' : 'APPOINTMENT INQUIRY'}</span><h2>Prepare a service request</h2><p>{config.enabled ? 'Local demo: use fictional details. Your test request will be saved to the local database for tracking. No real service is booked and no email is sent.' : 'Work through five short steps. This is a demo: no details are transmitted and no visit is booked.'}</p></div>
    <nav className="booking-progress" aria-label="Request progress"><ol>{steps.map((label, index) => <li key={label} className={`${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <AnimatedIcon name="check" size={16} animation="check" trigger="interaction" active /> : index + 1}</span><small>{label}</small></li>)}</ol></nav>
    {Object.values(errors).some(Boolean) && <div className="error-summary" ref={summary} tabIndex="-1" role="alert"><strong>Check these details:</strong><ul>{Object.entries(errors).filter(([, error]) => error).map(([key, error]) => <li key={key}><a href={`#booking-${key}`}>{error}</a></li>)}</ul></div>}
    {step === 0 && <div className="wizard-step"><h3 ref={heading} tabIndex="-1">Choose a service</h3>{field('service', <select {...attrs('service')}><option value="">Choose a service</option>{services.map(service => <option key={service.slug} value={service.slug}>{service.title}</option>)}<option value="other">Other / not sure</option></select>)}<fieldset className="booking-service-cards"><legend>Or choose a service card</legend>{[...services, { slug: 'other', title: 'Not sure', short: 'Help me choose the right starting point.' }].map(item => <label key={item.slug} className={values.service === item.slug ? 'is-selected' : ''}><input type="radio" name="booking-service-card" value={item.slug} checked={values.service === item.slug} onChange={() => set('service', item.slug)} /><AnimatedIcon name={problems.find(problem => problem.service === item.slug)?.icon || "message"} size={22} animation="lift" /><span><strong>{item.title}</strong><small>{item.short}</small></span></label>)}</fieldset><div className="field"><label htmlFor="booking-issue">What is happening? <small>(optional)</small></label><textarea {...attrs('issue')} rows="4" maxLength="500" placeholder="Describe the symptom and when it started." />{errors.issue && <span className="field-error" id="booking-issue-error">{errors.issue}</span>}</div></div>}
    {step === 1 && <div className="wizard-step"><h3 ref={heading} tabIndex="-1">Where is service needed?</h3><div className="field"><ZipCodeChecker compact value={values.zip} onChange={value => set('zip', value)} />{errors.zip && <span className="field-error" id="booking-zip-error">{errors.zip}</span>}</div>{field('address', <input {...attrs('address')} autoComplete="street-address" maxLength="160" placeholder="Street address" />)}<p className="small-note">Coverage is not verified. The ZIP check only confirms U.S. ZIP format until service-area data is supplied.</p></div>}
    {step === 2 && <div className="wizard-step"><h3 ref={heading} tabIndex="-1">Choose a preference</h3><p>These are preferred details, not a confirmed appointment.</p><div className="form-row">{field('date', <input {...attrs('date')} type="date" />)}{field('time', <select {...attrs('time')}><option value="">Select a time window</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select>)}</div></div>}
    {step === 3 && <div className="wizard-step"><h3 ref={heading} tabIndex="-1">How can the team reach you?</h3><div className="form-row">{field('name', <input {...attrs('name')} autoComplete="name" maxLength="100" />)}{field('phone', <input {...attrs('phone')} type="tel" autoComplete="tel" inputMode="tel" maxLength="30" />)}</div>{field('email', <input {...attrs('email')} type="email" autoComplete="email" maxLength="150" />)}</div>}
    {step === 4 && <div className="wizard-step"><h3 ref={heading} tabIndex="-1">Review your details</h3><p>{config.enabled ? 'Check your fictional test details before saving them to the local demo server.' : 'Check everything before a future booking connection is added.'}</p><dl className="booking-review">{Object.entries(values).filter(([key, value]) => value && key !== 'issue').map(([key, value]) => <div key={key}><dt>{labels[key]}</dt><dd>{key === 'service' ? services.find(item => item.slug === value)?.title || 'Other / not sure' : value}</dd></div>)}{values.issue && <div><dt>Issue description</dt><dd>{values.issue}</dd></div>}</dl><div className="review-edit"><button type="button" disabled={sending} onClick={() => move(0)}>Edit service</button><button type="button" disabled={sending} onClick={() => move(1)}>Edit location</button><button type="button" disabled={sending} onClick={() => move(2)}>Edit schedule</button><button type="button" disabled={sending} onClick={() => move(3)}>Edit contact</button></div><WetPaintButton as="button" type="button" className="btn btn-primary" disabled={sending || config.loading} onClick={submitRequest}>{sending ? 'Saving request...' : config.enabled ? 'Submit test request' : 'Finish demo review'} <AnimatedIcon name="check" size={18} animation="check" trigger="interaction" active={complete} /></WetPaintButton>{sendError && <p className="request-error" role="alert">{sendError}</p>}{complete && <div className="demo-status" role="status">Details reviewed. No request was sent and no appointment was booked. A secure booking service must be connected before this can be used with customers.</div>}</div>}
    {step < 4 && <div className="wizard-actions">{step > 0 && <WetPaintButton as="button" type="button" className="btn btn-outline" onClick={() => move(step - 1)}><ArrowLeft size={17} aria-hidden="true" /> Back</WetPaintButton>}<WetPaintButton as="button" type="button" className="btn btn-primary" onClick={next}>Next <ArrowRight size={17} aria-hidden="true" /></WetPaintButton></div>}
    <p className="form-privacy">{config.enabled ? 'Local demo only. Use fictional details; submitted data is stored in the local test database.' : 'Demo only. Do not enter sensitive information. No data is sent or stored.'}</p>
  </div>;
}
