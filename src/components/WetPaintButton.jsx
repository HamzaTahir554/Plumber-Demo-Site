import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function WetPaintButton({ as: Element = Link, children, className = '', onPointerEnter, onPointerLeave, ...props }) {
  const lastLeave = useRef(0);
  const hasOrigin = useRef(false);

  function enter(event) {
    if ((event.pointerType === 'mouse' || event.pointerType === 'pen') && (!hasOrigin.current || performance.now() - lastLeave.current > 560)) {
      const button = event.currentTarget;
      const bounds = button.getBoundingClientRect();
      const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      const farthestCorner = Math.max(
        Math.hypot(x, y), Math.hypot(bounds.width - x, y),
        Math.hypot(x, bounds.height - y), Math.hypot(bounds.width - x, bounds.height - y)
      );
      button.style.setProperty('--paint-x', `${x}px`);
      button.style.setProperty('--paint-y', `${y}px`);
      button.style.setProperty('--paint-diameter', `${Math.ceil(farthestCorner * 2.8 + 24)}px`);
      hasOrigin.current = true;
    }
    onPointerEnter?.(event);
  }

  function leave(event) {
    lastLeave.current = performance.now();
    onPointerLeave?.(event);
  }

  return <Element {...props} className={`wet-paint-button ${className}`.trim()} onPointerEnter={enter} onPointerLeave={leave}>
    <span className="wet-paint-content">{children}</span>
  </Element>;
}
