import React, { useRef } from 'react';

export default function WaterRipple({ as: Tag = 'div', className = '', children, ...props }) {
  const ring = useRef(null);
  const last = useRef(-Infinity);
  function enter(event) {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'yes' || performance.now() - last.current < 900) return;
    last.current = performance.now();
    const box = event.currentTarget.getBoundingClientRect();
    ring.current.style.left = `${event.clientX - box.left}px`;
    ring.current.style.top = `${event.clientY - box.top}px`;
    ring.current.getAnimations().forEach(animation => animation.cancel());
    ring.current.animate([{ transform: 'translate(-50%,-50%) scale(.1)', opacity: .35 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
  return <Tag {...props} className={`water-surface ${className}`} onPointerEnter={enter}>{children}<span className="water-ripple" ref={ring} aria-hidden="true" /></Tag>;
}
