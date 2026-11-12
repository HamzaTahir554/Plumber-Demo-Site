import { useLayoutEffect } from 'react';

export default function useReveal() {
  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'yes') return;
    const sections = [...document.querySelectorAll('main .section > .container, main .request-cta-inner, .footer-grid > div, .footer-bottom')];

    const cards = [...document.querySelectorAll('main .service-card, main .maintenance-card, main .review-card, main .gallery-card, main .audience-card, main .safety-card, main .editorial-panel, main .detail-panel, main .tool-aside, main .reviews-standard, main .contact-sidebar, main .why-points > div, main .home-tools-links > a')];
    const serviceGrids = [...document.querySelectorAll('main .service-grid')];
    const elements = [...new Set([...sections, ...document.querySelectorAll('main .reveal'), ...cards, ...serviceGrids])];
    if (!elements.length) return;
    let observer;
    // Read all geometry before class writes to avoid repeated layout flushes.
    const visible = new Set(elements.filter(element => {
      const box = element.getBoundingClientRect();
      return box.top < window.innerHeight * .85 && box.bottom > 0;
    }));
    // Register before hiding anything: failed observer setup leaves content visible.
    try {
      observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { rootMargin: '0px 0px -24px 0px', threshold: 0.06 });
      elements.forEach(element => { if (!visible.has(element)) observer.observe(element); });
    } catch {
      observer?.disconnect();
      return;
    }
    sections.forEach(section => section.classList.add('motion-section'));
    cards.forEach(card => {
      card.classList.add('content-reveal');
      card.dataset.contentMotion = '';
      card.style.setProperty('--content-order', Math.min([...card.parentElement.children].indexOf(card), 3));
    });
    document.documentElement.classList.add('js-motion');
    visible.forEach(element => element.classList.add('is-visible'));
    return () => { observer.disconnect(); document.documentElement.classList.remove('js-motion'); };
  }, []);
}
