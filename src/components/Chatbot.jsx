import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Trash2, X } from 'lucide-react';
import { services } from '../data/site.js';
import AnimatedIcon from './AnimatedIcon.jsx';

const welcome = { who: 'bot', text: 'Hello! I’m a demo plumbing guide. I can explain services, help you prepare a request, or point you to emergency guidance. What can I help with?' };
function loadMessages() { try { const saved = JSON.parse(sessionStorage.getItem('plumbing-demo-chat')); return Array.isArray(saved) && saved.length ? saved : [welcome]; } catch { return [welcome]; } }
function answer(question) {
  const q = question.toLowerCase();
  if (/gas|smell.*gas/.test(q)) return 'If you suspect a gas leak, leave the area immediately. Do not use switches, flames, or electrical devices nearby. From a safe place, call your gas utility or local emergency services. This demo chat cannot dispatch help.';
  if (/electric|outlet|wire|shock/.test(q)) return 'If water is near electrical equipment, stay clear of the area. Do not touch switches or appliances in wet conditions. Contact local emergency services or a qualified professional from a safe location.';
  if (/flood|burst|emergency|urgent/.test(q)) return 'If safe, turn off the main water supply. Avoid electrical hazards and call a qualified local emergency plumber. This is a demo site and has no live dispatch service.';
  if (/book|appointment|schedule|quote|estimate|price/.test(q)) return 'The Contact page has a five-step demo request form. You can select a service, enter a location and preferred time, then review your details. With the local demo server connected, it can save a fictional test request for tracking. Otherwise it only reviews your entries. No real visit is booked.';
  if (/area|zip|coverage|location/.test(q)) return 'Service-area coverage has not been supplied yet. The ZIP checker can validate format, but a real business contact must confirm availability.';
  if (/leak|drip/.test(q)) return 'Leak repair may involve finding the source and assessing the affected pipe or fixture. If water is actively escaping, turn off the supply if safe and seek professional help.';
  if (/drain|clog|backup/.test(q)) return 'For slow or blocked drains, avoid repeated chemical treatments. A professional can identify where the blockage is and the appropriate cleaning method.';
  if (/heater|hot water/.test(q)) return 'Water heater issues can involve temperature, supply, or equipment condition. A qualified technician can assess repair and replacement options.';
  if (/toilet|fixture|faucet/.test(q)) return 'Toilet and fixture service can address running toilets, leaks, weak flow, and replacement choices.';
  if (/pipe|sump|pump/.test(q)) return 'We have information pages for pipe repair and sump pumps. For active water damage, use the emergency guidance page.';
  if (/service|explore/.test(q)) return 'Explore leak repair, drain cleaning, water heaters, toilets and fixtures, pipe repair, and sump pumps on the Services page.';
  return 'I can provide general plumbing information, but this demo uses fixed responses. For a specific diagnosis, consult a qualified plumber. You can also explore the services or contact page.';
}
function serviceForQuestion(question) {
  const q = question.toLowerCase();
  if (/gas|electric|outlet|wire|shock|flood|burst|emergency|urgent/.test(q)) return '';
  if (/leak|drip/.test(q)) return 'leak-repair';
  if (/drain|clog|backup/.test(q)) return 'drain-cleaning';
  if (/heater|hot water/.test(q)) return 'water-heaters';
  if (/toilet|fixture|faucet/.test(q)) return 'toilet-fixture-repair';
  if (/sump|pump/.test(q)) return 'sump-pumps';
  if (/pipe|pressure/.test(q)) return 'pipe-repair';
  return '';
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedService, setSuggestedService] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [carryIssue, setCarryIssue] = useState(false);
  const launcher = useRef(null);
  const input = useRef(null);
  const log = useRef(null);
  const timer = useRef(null);
  const closeTimer = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => { try { sessionStorage.setItem('plumbing-demo-chat', JSON.stringify(messages)); } catch { /* still available in memory */ } }, [messages]);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } if (open) input.current?.focus(); else launcher.current?.focus(); }, [open]);
  useEffect(() => { if (open && log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, loading, open]);
  useEffect(() => { if (!open) return; const close = e => { if (e.key === 'Escape') closeChat(); }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open]);
  useEffect(() => () => { window.clearTimeout(timer.current); window.clearTimeout(closeTimer.current); }, []);
  useEffect(() => { const openFromPage = () => openChat(); window.addEventListener('plumbing:open-chat', openFromPage); return () => window.removeEventListener('plumbing:open-chat', openFromPage); }, []);
  function openChat() { window.clearTimeout(closeTimer.current); setClosing(false); setOpen(true); }
  function closeChat() { setOpen(false); setClosing(true); window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setClosing(false), 300); }
  function send(text) {
    const question = text.trim();
    if (!question || loading) return;
    setError('');
    setMessages(previous => [...previous, { who: 'user', text: question }]);
    setLastQuestion(question);
    setSuggestedService(serviceForQuestion(question));
    setCarryIssue(false);
    setValue('');
    setLoading(true);
    timer.current = window.setTimeout(() => {
      try { setMessages(previous => [...previous, { who: 'bot', text: answer(question) }]); }
      catch { setError('The demo assistant could not respond. Try again or use the contact page.'); }
      finally { setLoading(false); }
    }, 250);
  }
  function clear() { window.clearTimeout(timer.current); setMessages([welcome]); setLoading(false); setError(''); setSuggestedService(''); setLastQuestion(''); setCarryIssue(false); }
  const bookingQuery = new URLSearchParams();
  if (suggestedService) bookingQuery.set('service', suggestedService);
  if (carryIssue && lastQuestion) bookingQuery.set('issue', lastQuestion);
  const bookingUrl = `/contact${bookingQuery.size ? `?${bookingQuery}` : ''}#booking-wizard`;
  return <>
    <button type="button" className="chat-launcher" ref={launcher} aria-label={open ? 'Close demo chat' : 'Open demo chat'} aria-controls="chat-panel" aria-expanded={open} onClick={() => open ? closeChat() : openChat()}>{open ? <X aria-hidden="true" /> : <Bot aria-hidden="true" />}</button>
    {(open || closing) && <section className={`chat-panel ${closing ? 'is-closing' : ''}`} id="chat-panel" aria-label="Demo plumbing chat assistant" inert={closing ? true : undefined}>
      <div className="chat-header"><Bot aria-hidden="true" /><div><strong>Plumbing guide</strong><small>Demo · Fixed responses</small></div><button type="button" aria-label="Clear conversation" title="Clear conversation" onClick={clear}><Trash2 size={18} aria-hidden="true" /></button><button type="button" aria-label="Close chat" onClick={closeChat}><X size={20} aria-hidden="true" /></button></div>
      <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions text" ref={log}>
        {messages.length === 1 && <div className="chat-intro-icon"><AnimatedIcon name="bot" size={42} animation="fade" trigger="inView" /></div>}
        {messages.map((message, index) => <div key={index} className={`chat-bubble ${message.who}`}><span className="sr-only">{message.who === 'bot' ? 'Guide: ' : 'You: '}</span>{message.text}</div>)}
        {loading && <div className="chat-bubble bot" role="status">Preparing a demo response…</div>}
      </div>
      {error && <p className="chat-error" role="alert">{error}</p>}
      {suggestedService && !loading && <div className="chat-next-step"><strong>Possible service: {services.find(item => item.slug === suggestedService)?.title}</strong><p>Review the guide or prepare a demo request. A plumber must assess the actual issue.</p><label><input type="checkbox" checked={carryIssue} onChange={event => setCarryIssue(event.target.checked)} />Include my last message in the request form</label><Link to={bookingUrl} onClick={closeChat}>Prepare this service request</Link></div>}
      <div className="chat-actions" aria-label="Suggested questions"><button onClick={() => send('Explore services')}>Explore services</button><button onClick={() => send('Book a service')}>Book a service</button><button onClick={() => send('Emergency plumbing')}>Emergency help</button><button onClick={() => send('Get a quote')}>Get a quote</button></div>
      <form className="chat-form" onSubmit={e => { e.preventDefault(); send(value); }}><label className="sr-only" htmlFor="chat-input">Ask the demo plumbing guide</label><input id="chat-input" ref={input} value={value} onChange={e => setValue(e.target.value)} maxLength="500" placeholder="Ask a plumbing question" /><button type="submit" aria-label="Send message" disabled={!value.trim() || loading}><Send size={19} aria-hidden="true" /></button></form>
      <p className="chat-disclaimer">Fixed demo responses · No live agent or dispatch. <Link to={bookingUrl} onClick={closeChat}>Request form</Link> · <Link to="/service-area" onClick={closeChat}>Service area</Link> · <Link to="/emergency" onClick={closeChat}>Urgent guidance</Link></p>
    </section>}
  </>;
}
