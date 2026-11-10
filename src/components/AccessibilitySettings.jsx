import React, { useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

function readSetting(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } }

export default function AccessibilitySettings({ onClose }) {
  const [contrast, setContrast] = useState(() => readSetting('plumbing-contrast', false));
  const [scale, setScale] = useState(() => readSetting('plumbing-scale', 100));
  const [motion, setMotion] = useState(() => readSetting('plumbing-motion', false));
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.querySelector('button')?.focus(); }, []);
  useEffect(() => {
    document.documentElement.dataset.contrast = contrast ? 'high' : 'normal';
    document.documentElement.dataset.reduceMotion = motion ? 'yes' : 'no';
    document.documentElement.style.fontSize = `${scale}%`;
    try { localStorage.setItem('plumbing-contrast', JSON.stringify(contrast)); localStorage.setItem('plumbing-scale', JSON.stringify(scale)); localStorage.setItem('plumbing-motion', JSON.stringify(motion)); } catch { /* preferences still work this visit */ }
  }, [contrast, scale, motion]);
  useEffect(() => { document.body.classList.add('dialog-active'); return () => document.body.classList.remove('dialog-active'); }, []);
  function handleKeys(event) {
    if (event.key === 'Escape') { onClose(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.current.querySelectorAll('button:not(:disabled),a[href]')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <div className="dialog-backdrop" onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={dialog} onKeyDown={handleKeys}>
      <div className="dialog-heading"><div><span className="eyebrow">DISPLAY PREFERENCES</span><h2 id="settings-title">Accessibility options</h2></div><button className="icon-button" type="button" aria-label="Close accessibility settings" onClick={onClose}><X /></button></div>
      <p>Adjust the display for this browser. Your system’s reduced motion preference is also respected.</p>
      <div className="setting-row"><span>Higher contrast</span><button type="button" aria-label={`Higher contrast: ${contrast ? 'On' : 'Off'}`} aria-pressed={contrast} onClick={() => setContrast(!contrast)}>{contrast ? 'On' : 'Off'}</button></div>
      <div className="setting-row"><span>Text size</span><div className="size-stepper"><button type="button" aria-label="Decrease text size" disabled={scale <= 100} onClick={() => setScale(scale - 10)}><Minus size={17} /></button><span aria-live="polite">{scale}%</span><button type="button" aria-label="Increase text size" disabled={scale >= 130} onClick={() => setScale(scale + 10)}><Plus size={17} /></button></div></div>
      <div className="setting-row"><span>Reduce motion</span><button type="button" aria-label={`Reduce motion: ${motion ? 'On' : 'Off'}`} aria-pressed={motion} onClick={() => setMotion(!motion)}>{motion ? 'On' : 'Off'}</button></div>
      <p className="small-note">These controls supplement the accessible page design. They do not certify WCAG or ADA compliance.</p>
    </section></div>;
}
