import React, { useEffect, useRef } from 'react';
import { Wrench } from 'lucide-react';

export default function ScrollTool() {
  const trackRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const icon = iconRef.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      frame = 0;
      if (motionPreference.matches || document.documentElement.dataset.reduceMotion === 'yes') {
        track.style.setProperty('--tool-travel', '0px');
        return;
      }
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = scrollable ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      track.style.setProperty('--tool-progress', progress);
      const distance = Math.max(0, track.clientWidth - icon.offsetWidth);
      track.style.setProperty('--tool-travel', `${Math.round(distance * progress)}px`);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(track);
    resizeObserver.observe(document.documentElement);
    const preferenceObserver = new MutationObserver(schedule);
    preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
    motionPreference.addEventListener('change', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      preferenceObserver.disconnect();
      motionPreference.removeEventListener('change', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return <div className="scroll-tool-track" ref={trackRef} aria-hidden="true">
    <span className="scroll-tool-icon" ref={iconRef}><Wrench size={17} strokeWidth={2.2} /></span>
  </div>;
}
