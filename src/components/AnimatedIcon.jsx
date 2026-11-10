import React, { useEffect, useRef, useState } from 'react';
import { Accessibility, Bot, Building2, CalendarCheck, CheckCircle2, ClipboardList, Droplets, Gauge, House, Mail, MapPin, MessageSquareText, Phone, ShieldCheck, Siren, Thermometer, Waves, Wrench } from 'lucide-react';

const icons = { accessibility: Accessibility, bot: Bot, building: Building2, calendar: CalendarCheck, check: CheckCircle2, clipboard: ClipboardList, droplets: Droplets, gauge: Gauge, house: House, mail: Mail, mapPin: MapPin, message: MessageSquareText, phone: Phone, shield: ShieldCheck, siren: Siren, thermometer: Thermometer, waves: Waves, wrench: Wrench };

function PipeIcon({ size, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h8a3 3 0 0 1 3 3v3" /><path d="M14 12v3a3 3 0 0 0 3 3h4" /><path d="M3 3v6M21 15v6" /><circle cx="14" cy="12" r="1" /></svg>;
}

export default function AnimatedIcon({ name, size = 28, animation = 'none', trigger = 'hover', duration = 600, decorative = true, label, active = false, className = '', style }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (trigger !== 'inView' || !ref.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setInView(true); observer.disconnect(); }
    }, { threshold: .2 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger]);
  const Icon = name === 'pipe' ? PipeIcon : icons[name];
  if (!Icon) return null;
  const enabled = trigger === 'inView' ? inView : trigger === 'interaction' ? active : false;
  return <span ref={ref} className={`animated-icon animated-icon--${animation} animated-icon--${trigger} ${enabled ? 'is-active' : ''} ${className}`.trim()} style={{ '--icon-duration': `${duration}ms`, ...style }} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label || name })}><Icon size={size} aria-hidden="true" focusable="false" /></span>;
}
