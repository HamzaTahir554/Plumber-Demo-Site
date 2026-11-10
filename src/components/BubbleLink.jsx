import React from 'react';
import { Link } from 'react-router-dom';

export default function BubbleLink({ children, className = '', ...props }) {
  function setBubbleOrigin(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--bubble-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--bubble-y', `${event.clientY - bounds.top}px`);
  }

  return <Link {...props} className={`bubble-button ${className}`.trim()} onPointerEnter={setBubbleOrigin}>
    <span className="bubble-button-content">{children}</span>
  </Link>;
}
