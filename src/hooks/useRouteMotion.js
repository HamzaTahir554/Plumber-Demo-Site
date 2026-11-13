import { useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'yes';

export default function useRouteMotion() {
  const location = useLocation();
  const kind = useNavigationType();
  const navigate = useNavigate();
  const positions = useRef(new Map());
  const current = useRef(location.key);
  const first = useRef(true);
  const active = useRef(null);
  const ticket = useRef(0);
  const restoreHistory = kind === 'POP' && positions.current.has(location.key);
  // Register before BrowserRouter's parent layout subscription so POP saves the outgoing position first.
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    function save() { positions.current.set(current.current, window.scrollY); }
    function pop() { save(); ticket.current++; active.current?.skipTransition?.(); active.current?.cancel?.(); delete document.documentElement.dataset.routeTransition; }
    function click(event) {
      const link = event.target.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || link.target && link.target !== '_self') return;
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      save();
      const id = ++ticket.current;
      active.current?.skipTransition?.(); active.current?.cancel?.();
      if (url.pathname === window.location.pathname || reduceMotion()) {
        delete document.documentElement.dataset.routeTransition;
        return;
      }
      event.preventDefault();
      const go = () => { if (id === ticket.current) flushSync(() => navigate(url.pathname + url.search + url.hash)); };
      if (document.startViewTransition) {
        document.documentElement.dataset.routeTransition = 'native';
        active.current = document.startViewTransition(go);
        active.current.ready.catch(() => {}); // Back/rapid navigation can intentionally skip a snapshot.
        active.current.finished.catch(() => {});
      } else {
        delete document.documentElement.dataset.routeTransition;
        const surface = document.querySelector('.route-surface');
        if (!surface?.animate) { go(); return; }
        active.current = surface.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: .85, transform: 'translateY(-8px)' }], { duration: 160, easing: 'cubic-bezier(.22,1,.36,1)' });
        active.current.finished.then(go).catch(() => {});
      }
    }
    document.addEventListener('click', click, true);
    window.addEventListener('popstate', pop, true);
    return () => { ticket.current++; active.current?.skipTransition?.(); active.current?.cancel?.(); delete document.documentElement.dataset.routeTransition; document.removeEventListener('click', click, true); window.removeEventListener('popstate', pop, true); history.scrollRestoration = previous; };
  }, []);
  useLayoutEffect(() => {
    current.current = location.key;
    if (first.current) { first.current = false; return; }
    if (location.hash && !restoreHistory) return;
    window.scrollTo({ top: kind === 'POP' ? positions.current.get(location.key) || 0 : 0, behavior: 'instant' });
    document.querySelector('main h1')?.focus({ preventScroll: true });
  }, [location.key, location.hash, kind, restoreHistory]);
  return restoreHistory;
}
