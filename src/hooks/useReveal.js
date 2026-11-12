import { useLayoutEffect } from 'react';

export default function useReveal() {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'yes') return;
    const sections = [...document.querySelectorAll('main .section > .container, main .request-cta-inner, .footer-grid > div, .footer-bottom')];

    const elements = [...new Set([...sections, ...document.querySelectorAll('main .reveal')])];
    if (!elements.length) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -24px 0px', threshold: 0.06 });
    // Read all geometry before class writes to avoid repeated layout flushes.
    const visible = new Set(elements.filter(element => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight * .85 && box.bottom > 0;
    }));
    sections.forEach(section => section.classList.add('motion-section'));
    document.documentElement.classList.add('js-motion');
    elements.forEach(element => {
      if (visible.has(element)) element.classList.add('is-visible');
      else observer.observe(element);
    });
    return () => { observer.disconnect(); document.documentElement.classList.remove('js-motion'); };
  }, []);
}
