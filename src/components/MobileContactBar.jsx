import React, { useEffect, useState } from 'react';
import { Phone, CalendarCheck } from 'lucide-react';
import WetPaintButton from './WetPaintButton.jsx';
import { verifiedPhone } from '../data/site.js';

export default function MobileContactBar({ pathname, menuOpen, accessOpen }) {
  const [useful, setUseful] = useState(false);
  const [typing, setTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    setUseful(false);
    const visible = new Set();
    const targets = [...document.querySelectorAll('.hero-banner, .request-cta, .footer, .tool-main, .faq-system, .comparison, .hotspot-feature')];
    if (!('IntersectionObserver' in window)) return;
    let observer;
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
        setUseful(visible.size === 0);
      });
      targets.forEach(target => observer.observe(target));
    } catch {
      observer?.disconnect();
      return; // Optional shortcut stays hidden; normal page actions remain available.
    }
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    const update = () => setTyping(Boolean(document.activeElement?.matches('input, textarea, select, [contenteditable=true]')));
    const updateChat = () => setChatOpen(document.querySelector('.chat-launcher')?.getAttribute('aria-expanded') === 'true');
    document.addEventListener('focusin', update); document.addEventListener('focusout', update);
    const observer = new MutationObserver(updateChat);
    const launcher = document.querySelector('.chat-launcher');
    if (launcher) observer.observe(launcher, { attributes: true, attributeFilter: ['aria-expanded'] });
    update(); updateChat();
    return () => { document.removeEventListener('focusin', update); document.removeEventListener('focusout', update); observer.disconnect(); };
  }, []);
  const shown = useful && !typing && !chatOpen && !menuOpen && !accessOpen && pathname !== '/contact';
  return <nav className={`mobile-contact-bar ${shown ? 'is-visible' : ''}`} aria-label="Quick contact" aria-hidden={!shown} inert={!shown ? '' : undefined}>
    <WetPaintButton as="a" className="btn btn-primary green-action" href={verifiedPhone ? `tel:${verifiedPhone}` : '/contact#contact-details'} tabIndex={shown ? 0 : -1}><Phone size={18} aria-hidden="true" /><span>Call Now{!verifiedPhone && <small>Demo contact</small>}</span></WetPaintButton>
    <WetPaintButton className="btn btn-primary green-action" to="/contact#booking-wizard" tabIndex={shown ? 0 : -1}><CalendarCheck size={18} aria-hidden="true" />Request Service</WetPaintButton>
  </nav>;
}
