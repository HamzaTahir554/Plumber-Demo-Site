import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, RefreshCw, LockKeyhole, ArrowRight } from 'lucide-react';
import { PageHero } from '../components/Shared.jsx';
import WetPaintButton from '../components/WetPaintButton.jsx';
import RequestTimeline from '../components/RequestTimeline.jsx';
import useRequestConfig from '../hooks/useRequestConfig.js';
import { post, requestApi } from '../lib/requestApi.js';
import { requestStatuses, displayTime } from '../data/requestStatuses.js';
import { services } from '../data/site.js';

export default function TrackRequest() {
  const location = useLocation(), config = useRequestConfig();
  const [reference, setReference] = useState((new URLSearchParams(location.search).get('reference') || '').slice(0, 40)), [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState(null), [code, setCode] = useState('');
  const [result, setResult] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [auto, setAuto] = useState(false);
  const codeInput = useRef(null), resultHeading = useRef(null), pending = useRef(false);
  const refreshController = useRef(null);
  useEffect(() => () => refreshController.current?.abort(), []);
  async function refresh(quiet = false) {
    if (pending.current) return;
    pending.current = true; if (!quiet) setBusy(true);
    const controller = new AbortController(); refreshController.current = controller;
    try { const next = await requestApi('/tracking', { signal: controller.signal }); if (controller.signal.aborted) return; setResult(next); setError(''); if (!quiet) setNotice('Latest saved status loaded.'); }
    catch (e) { if (controller.signal.aborted) return; if (e.status === 401) { setResult(null); setAuto(false); } setError(e.message); }
    finally { pending.current = false; if (!quiet) setBusy(false); }
  }
  useEffect(() => {
    if (!config.enabled) return;
    const controller = new AbortController();
    requestApi('/tracking', { signal: controller.signal }).then(value => { if (!controller.signal.aborted) setResult(value); }).catch(() => {});
    return () => controller.abort();
  }, [config.enabled]);
  useEffect(() => { if (challenge) codeInput.current?.focus(); }, [challenge]);
  useEffect(() => {
    if (!auto || !result) return;
    const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(true); }, 30000);
    return () => clearInterval(timer);
  }, [auto, Boolean(result)]);
  async function verify(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError(''); setNotice('');
    try {
      if (!challenge) { const response = await post('/verification/start', { reference, email }); setChallenge(response.challenge); setNotice(response.message); }
      else { await post('/verification/complete', { challenge, code }); const response = await requestApi('/tracking'); setResult(response); setCode(''); setChallenge(null); setNotice('Access verified. Showing saved test request data.'); requestAnimationFrame(() => resultHeading.current?.focus()); }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <><PageHero variant="contact" eyebrow="SERVICE REQUESTS" title="Track Your Service Request" text="Check the latest status of your plumbing service request." imageName="company-service-van" imageAlt="Plumbing service van" position="center center" mobilePosition="57% center" />
    <section className="section request-workspace"><div className="container"><div className="request-demo-note"><ShieldCheck size={22} aria-hidden="true" /><div><strong>Local demonstration only</strong><p>Use fictional details. Requests and staff updates are saved only by the local demo server. Verification messages go to its private test inbox; no email is sent and no actual service is arranged.</p></div></div>
      {config.loading ? <p role="status">Checking request service…</p> : !config.enabled ? <div className="request-panel"><LockKeyhole size={28} aria-hidden="true" /><h2>Tracking is not connected</h2><p>This demonstration website has no hosted request service. The local request server must be running to submit or track test requests. No request records are available here.</p><Link to="/contact#contact-details">View demo contact details <ArrowRight size={16} aria-hidden="true" /></Link></div> : <>
        <p className="request-feedback" role="status">{notice}</p>{error && <p className="request-error" role="alert">{error}</p>}
        {result ? <div className="request-results"><div className="request-panel request-summary"><span className="eyebrow">VERIFIED TEST REQUEST</span><h2 ref={resultHeading} tabIndex="-1">{requestStatuses[result.status]?.label}</h2><p>{requestStatuses[result.status]?.text}</p><dl><div><dt>Reference</dt><dd className="request-reference">{result.reference}</dd></div><div><dt>Service</dt><dd>{services.find(item => item.slug === result.service)?.title || 'Other / not sure'}</dd></div><div><dt>Submitted</dt><dd>{displayTime(result.createdAt)}</dd></div><div><dt>Last updated</dt><dd>{displayTime(result.updatedAt)}</dd></div><div><dt>Preferred visit (not confirmed)</dt><dd>{result.preferredDate} · {result.preferredTime}</dd></div><div><dt>Recorded appointment</dt><dd>{displayTime(result.appointment)}<small>Times are shown in your device timezone.</small></dd></div></dl><div className="request-actions"><button type="button" className="btn btn-outline" disabled={busy} onClick={() => refresh()}><RefreshCw size={16} aria-hidden="true" />{busy ? 'Refreshing…' : 'Refresh status'}</button><button type="button" className="btn btn-outline" disabled={busy} onClick={async () => { setBusy(true); refreshController.current?.abort(); try { await post('/tracking/logout'); setResult(null); setAuto(false); setNotice('Signed out of this request.'); } catch (e) { setError(e.message); } finally { setBusy(false); } }}>Sign out</button></div><label className="request-check"><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)} />Refresh every 30 seconds while this tab is visible</label><Link to="/contact#contact-details">Contact support (demo details)</Link></div><div className="request-panel"><span className="eyebrow">ACTUAL RECORDED EVENTS</span><h2>Request history</h2><p>Only saved events appear here, including reschedules and corrections.</p><RequestTimeline events={result.events} /></div></div> : <div className="request-verify-layout"><form className="request-panel" onSubmit={verify} aria-busy={busy}><LockKeyhole size={28} aria-hidden="true" /><h2>{challenge ? 'Verify your access' : 'Find your request securely'}</h2><p>A reference alone cannot unlock a request. Use the email address entered during submission.</p>{!challenge ? <><div className="field"><label htmlFor="track-reference">Request reference</label><input id="track-reference" required maxLength={40} autoCapitalize="characters" autoComplete="off" placeholder="PS-…" value={reference} onChange={event => setReference(event.target.value)} /></div><div className="field"><label htmlFor="track-email">Request email address</label><input id="track-email" required type="email" maxLength={150} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></div></> : <div className="field"><label htmlFor="track-code">8-digit verification code</label><input ref={codeInput} id="track-code" required pattern="[0-9]{8}" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={event => setCode(event.target.value)} aria-describedby="track-code-help" /><p id="track-code-help">The demo operator can read the matching message in the local test inbox. Codes expire after 10 minutes and can be used once.</p></div>}<WetPaintButton as="button" type="submit" className="btn btn-primary green-action" disabled={busy}>{busy ? 'Please wait…' : challenge ? 'Track request' : 'Get verification code'}<ArrowRight size={16} aria-hidden="true" /></WetPaintButton>{challenge && <button className="request-text-button" type="button" disabled={busy} onClick={() => { setChallenge(null); setCode(''); setNotice(''); setError(''); }}>Change details or request a new code</button>}</form><aside className="request-panel request-help"><h2>Private by design</h2><p>Verification opens only the matching request. Personal contact details and staff notes never appear in the customer tracker.</p><h3>Need a reference?</h3><p>Copy it from the confirmation shown after a test request is saved.</p><Link to="/contact#booking-wizard">Prepare a request</Link><Link to="/contact#faq">Read request FAQs</Link><Link to="/contact#contact-details">Contact support (demo)</Link></aside></div>}
      </>}
    </div></section></>;
}
