import { useLayoutEffect } from 'react';

export default function useReveal() {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'yes') return;
    const sections = [...document.querySelectorAll('main .section > .container, main .request-cta-inner')];
    sections.forEach(section => section.classList.add('motion-section'));
    const elements = [...new Set([...sections, ...document.querySelectorAll('main .reveal')])];
    if (!elements.length) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -24px 0px', threshold: 0.06 });
    document.documentElement.classList.add('js-motion');
    elements.forEach(element => {
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight * .85 && box.bottom > 0) element.classList.add('is-visible');
      else observer.observe(element);
    });
    return () => { observer.disconnect(); document.documentElement.classList.remove('js-motion'); };
  }, []);
}
