import { canonicalService } from '../data/serviceCatalog.js';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Info } from 'lucide-react';
import { services } from '../data/site.js';
import BookingWizard from './BookingWizard.jsx';
import WetPaintButton from './WetPaintButton.jsx';

const labels = { name: 'Full name', email: 'Email address', phone: 'Phone number', service: 'Service type', date: 'Preferred date', time: 'Preferred time', location: 'Service address or ZIP code', message: 'Problem description' };
const initial = { name: '', email: '', phone: '', service: '', date: '', time: '', location: '', message: '' };
function validate(values, variant) {
  const errors = {};
  const required = variant === 'appointment' ? Object.keys(initial) : ['name', 'email', 'phone', 'message'];
  required.forEach(key => { if (!values[key].trim()) errors[key] = `Enter your ${labels[key].toLowerCase()}.`; });
  if (values.name && values.name.trim().length < 2) errors.name = 'Enter at least two characters for your name.';
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter an email address in the format name@example.com.';
  if (values.phone && values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a phone number with at least 10 digits.';
  if (values.date) {
    const selected = new Date(`${values.date}T12:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(selected.getTime()) || selected < today) errors.date = 'Choose today or a future date.';
  }
  if (values.message && values.message.trim().length < 10) errors.message = 'Describe the issue in at least 10 characters.';
  return errors;
}

export default function RequestForm({ variant = 'appointment' }) {
  return variant === 'appointment' ? <BookingWizard /> : <GeneralRequestForm variant={variant} />;
}

function GeneralRequestForm({ variant }) {
  const [params] = useSearchParams();
  const suggested = canonicalService(params.get('service'));
  const [values, setValues] = useState(() => ({ ...initial, service: services.some(s => s.slug === suggested) ? suggested : '' }));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const summary = useRef(null);
  useEffect(() => { if (suggested && services.some(s => s.slug === suggested)) setValues(v => ({ ...v, service: suggested })); }, [suggested]);
  const idPrefix = variant === 'appointment' ? 'appointment' : 'contact';
  const field = (key, control) => <div className="field" key={key}><label htmlFor={`${idPrefix}-${key}`}>{labels[key]} <span aria-hidden="true">*</span></label>{control}<span className="field-error" id={`${idPrefix}-${key}-error`}>{errors[key] || ''}</span></div>;
  const attrs = key => ({ id: `${idPrefix}-${key}`, name: key, value: values[key], 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${idPrefix}-${key}-error` : undefined, onChange: e => { setValues(v => ({ ...v, [key]: e.target.value })); setErrors(v => ({ ...v, [key]: '' })); setSubmitted(false); } });
  function submit(event) {
    event.preventDefault();
    const next = validate(values, variant);
    setErrors(next);
    if (Object.keys(next).length) { setSubmitted(false); window.setTimeout(() => summary.current?.focus(), 0); return; }
    setSubmitted(true);
  }
  return <div className="form-card">
    <div className="form-top"><span className="eyebrow">{variant === 'appointment' ? 'APPOINTMENT INQUIRY' : 'GENERAL MESSAGE'}</span><h2>{variant === 'appointment' ? 'Prepare a service request' : 'Send a message'}</h2><p>Fields marked * are required. This is a demo form; nothing is transmitted or booked.</p></div>
    {Object.values(errors).some(Boolean) && <div className="error-summary" ref={summary} tabIndex="-1" role="alert"><strong>Please correct the following:</strong><ul>{Object.entries(errors).filter(([,error]) => error).map(([key,error]) => <li key={key}><a href={`#${idPrefix}-${key}`}>{error}</a></li>)}</ul></div>}
    {submitted && <div className="demo-status" role="status"><Info size={19} aria-hidden="true" /><span>Your details are complete in this demo. No message was sent and no appointment was booked. Connect a secure booking service before using this form with customers.</span></div>}
    <form noValidate onSubmit={submit}>
      <div className="form-row">{field('name', <input {...attrs('name')} autoComplete="name" maxLength="100" />)}{field('email', <input {...attrs('email')} type="email" autoComplete="email" maxLength="150" />)}</div>
      <div className="form-row">{field('phone', <input {...attrs('phone')} type="tel" autoComplete="tel" maxLength="30" inputMode="tel" />)}{variant === 'appointment' && field('service', <select {...attrs('service')}><option value="">Select a service</option>{services.map(s => <option value={s.slug} key={s.slug}>{s.title}</option>)}<option value="other">Other / not sure</option></select>)}</div>
      {variant === 'appointment' && <><div className="form-row">{field('date', <input {...attrs('date')} type="date" />)}{field('time', <select {...attrs('time')}><option value="">Select a time window</option><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option></select>)}</div>{field('location', <input {...attrs('location')} autoComplete="street-address" maxLength="160" placeholder="Address or ZIP code" />)}</>}
      {field('message', <textarea {...attrs('message')} rows="5" maxLength="2000" placeholder="Tell us what is happening and when it started." />)}
      <WetPaintButton as="button" type="submit" className="btn btn-primary">Check request details <ArrowRight size={17} aria-hidden="true" /></WetPaintButton>
      <p className="form-privacy"><AlertCircle size={16} aria-hidden="true" /> Demo only. Do not enter sensitive information. No data is sent or stored.</p>
    </form>
  </div>;
}
