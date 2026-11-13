import React, { useLayoutEffect, useRef } from 'react';

export default function AnimatedHeading({ children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    function measure() {
      const words = [...element.querySelectorAll('.heading-word')];
      const tops = words.map(word => word.offsetTop);
      const lines = [...new Set(tops)];
      words.forEach((word, index) => word.style.setProperty('--heading-line', Math.min(lines.indexOf(tops[index]), 5)));
    }
    measure();
    if (!('ResizeObserver' in window)) return;
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [children]);
  return <h1 ref={ref} tabIndex="-1" className="animated-heading" aria-label={children}>{String(children).split(' ').map((word, index) => <React.Fragment key={index}><span className="heading-word" aria-hidden="true">{word}</span>{' '}</React.Fragment>)}</h1>;
}
