import { useEffect } from 'react';

// One event-driven frame batches geometry reads before style writes. No React state.
export default function useScrollMotion(pathname) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = [...document.querySelectorAll('.split-image, .why-photo, .section-heading, .hero-trust')];
    let frame = 0;
    const clamp = value => Math.max(0, Math.min(1, value));
    function update() {
      frame = 0;
      const reduced = media.matches || root.dataset.reduceMotion === 'yes';
      const height = window.innerHeight;
      const progress = reduced ? 0 : clamp(window.scrollY / Math.max(1, root.scrollHeight - height));
      // Layout offsets exclude entrance transforms, keeping reversal deterministic.
      const positions = targets.map(element => {
        let top = 0;
        for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
        return { element, top: top - window.scrollY };
      });
      root.style.setProperty('--page-scroll-progress', progress);
      positions.forEach(({ element, top }) => {
        const entry = reduced ? 1 : clamp((height - top) / (height * .45));
        const banner = element.classList.contains('hero-trust');
        element.style.setProperty('--scroll-offset', `${banner ? (reduced ? 0 : -4 * clamp(-top / height)) : (1 - entry) * 12}px`);
        element.style.setProperty('--scroll-opacity', .88 + entry * .12);
        element.style.setProperty('--scroll-scale', 1.02 - entry * .02);
        element.classList.add('scroll-linked');
      });
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    media.addEventListener('change', schedule);
    const preferenceObserver = new MutationObserver(schedule);
    preferenceObserver.observe(root, { attributes: true, attributeFilter: ['data-reduce-motion'] });
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      media.removeEventListener('change', schedule);
      preferenceObserver.disconnect();
      resizeObserver.disconnect();
      targets.forEach(element => element.classList.remove('scroll-linked'));
      root.style.removeProperty('--page-scroll-progress');
    };
  }, [pathname]);
}
