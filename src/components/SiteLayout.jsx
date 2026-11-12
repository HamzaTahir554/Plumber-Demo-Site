import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Clock3, Mail, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { brand, email, image, phone, services } from '../data/site.js';
import Chatbot from './Chatbot.jsx';
import AccessibilitySettings from './AccessibilitySettings.jsx';
import WetPaintButton from './WetPaintButton.jsx';
import ScrollTool from './ScrollTool.jsx';
import { AccessibilityActionsContext } from './AccessibilityActions.jsx';

const pageTitles = { '/': 'Plumbing services for home & business', '/services': 'Plumbing services', '/problem-finder': 'Plumbing problem finder', '/service-area': 'Service area checker', '/projects': 'Project gallery', '/maintenance': 'Plumbing maintenance', '/residential': 'Residential plumbing', '/commercial': 'Commercial plumbing', '/emergency': 'Emergency plumbing guidance', '/about': 'About us', '/contact': 'Contact & request service', '/reviews': 'Reviews', '/accessibility': 'Accessibility statement', '/privacy': 'Privacy policy template' };

export default function SiteLayout({ children }) {
  const location = useLocation();
  useEffect(() => {
    // Retry a transient asset failure once; retain meaningful alt text if unavailable.
    const retryImage = event => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.retried || !img.getAttribute('src')?.startsWith('/assets/images/')) return;
      img.dataset.retried = 'yes';
      const url = new URL(img.src); url.searchParams.set('retry', '1'); img.src = url.href;
    };
    document.addEventListener('error', retryImage, true);
    return () => document.removeEventListener('error', retryImage, true);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const menuButton = useRef(null);
  const accessTrigger = useRef(null);
  const navRef = useRef(null);
  const outroRef = useRef(null);
  const footerRef = useRef(null);
  const firstRoute = useRef(true);
  const menuTimer = useRef(null);

  useEffect(() => {
    try {
      document.documentElement.dataset.contrast = JSON.parse(localStorage.getItem('plumbing-contrast')) ? 'high' : 'normal';
      document.documentElement.dataset.reduceMotion = JSON.parse(localStorage.getItem('plumbing-motion')) ? 'yes' : 'no';
      document.documentElement.style.fontSize = `${JSON.parse(localStorage.getItem('plumbing-scale')) || 100}%`;
    } catch { /* browser storage is optional */ }
  }, []);

  useEffect(() => {
    const service = services.find(s => location.pathname === `/services/${s.slug}`);
    const title = service ? service.title : pageTitles[location.pathname] || 'Page not found';
    const description = service ? service.short : `Explore ${title.toLowerCase()} at ${brand} Plumbing Services. Demo website; business details and booking must be connected before launch.`;
    document.title = `${title} | ${brand} Plumbing Services`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    setMenuOpen(false);
    setMenuClosing(false);
    window.clearTimeout(menuTimer.current);
    if (firstRoute.current) { firstRoute.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    const id = window.setTimeout(() => document.querySelector('main h1')?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => () => window.clearTimeout(menuTimer.current), []);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const update = () => { document.documentElement.dataset.mobileMenuOpen = menuOpen && query.matches ? 'yes' : 'no'; };
    update(); query.addEventListener('change', update);
    return () => { query.removeEventListener('change', update); delete document.documentElement.dataset.mobileMenuOpen; };
  }, [menuOpen]);

  useEffect(() => {
    function updateSelection() {
      const value = document.getSelection()?.isCollapsed === false ? 'yes' : 'no';
      if (document.documentElement.dataset.textSelection !== value) document.documentElement.dataset.textSelection = value;
    }
    document.addEventListener('selectionchange', updateSelection);
    return () => { document.removeEventListener('selectionchange', updateSelection); delete document.documentElement.dataset.textSelection; };
  }, []);

  useEffect(() => {
    let previous = window.scrollY > 12;
    setHeaderScrolled(previous);
    const update = () => {
      const next = window.scrollY > 12;
      if (next !== previous) { previous = next; setHeaderScrolled(next); }
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useLayoutEffect(() => {
    const shell = outroRef.current;
    const footer = footerRef.current;
    const main = shell.querySelector('main');
    const resizeObserver = new ResizeObserver(schedule);
    let requestCta = null;
    let frame = 0;

    function update() {
      frame = 0;
      const nextCta = main.querySelector('.route-surface > .request-cta:last-child');
      if (nextCta !== requestCta) {
        if (requestCta) resizeObserver.unobserve(requestCta);
        requestCta = nextCta;
        if (requestCta) resizeObserver.observe(requestCta);
      }
      const height = footer.getBoundingClientRect().height + (requestCta?.getBoundingClientRect().height || 0);
      shell.style.setProperty('--outro-height', `${Math.ceil(height)}px`);
    }
    function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }

    resizeObserver.observe(footer);
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(main, { childList: true, subtree: true });
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [location.pathname]);

  function closeMenu() {
    if (!menuOpen) return;
    setMenuOpen(false);
    setMenuClosing(true);
    window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(() => setMenuClosing(false), 230);
  }

  function toggleMenu(event) {
    if (menuOpen) { closeMenu(); return; }
    window.clearTimeout(menuTimer.current);
    setMenuClosing(false);
    setMenuOpen(true);
    if (event.detail === 0) window.setTimeout(() => document.querySelector('#main-nav > a')?.focus(), 0);
  }


  useEffect(() => {
    if (!location.hash) return;
    const targetId = decodeURIComponent(location.hash.slice(1));
    let timer;
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      timer = window.setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }), 130);
      return true;
    };
    if (scrollToTarget()) return () => window.clearTimeout(timer);
    const observer = new MutationObserver(() => { if (scrollToTarget()) observer.disconnect(); });
    observer.observe(document.getElementById('main'), { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 2500);
    return () => { observer.disconnect(); window.clearTimeout(timeout); window.clearTimeout(timer); };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (event.target instanceof Element && event.target.closest('.chat-panel')) return;
      if (menuOpen) { closeMenu(); menuButton.current?.focus(); }
    }
    function onPointerDown(event) {
      if (navRef.current && !navRef.current.contains(event.target)) { closeMenu(); }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('pointerdown', onPointerDown); };
  }, [menuOpen]);

  function openAccess(event) { accessTrigger.current = event.currentTarget; setAccessOpen(true); }
  function closeAccess() { setAccessOpen(false); window.setTimeout(() => accessTrigger.current?.focus(), 0); }

  return <AccessibilityActionsContext.Provider value={openAccess}>
    <a className="skip-link" href="#main">Skip to main content</a>
    <header className={`site-header ${headerScrolled ? 'is-scrolled' : ''}`} ref={navRef}>
      <div className="container nav-shell">
        <Link to="/" className="brand"><img src={image('company-logo')} width="46" height="52" alt="" /><span className="brand-label"><strong>{brand}</strong><small>PLUMBING SERVICES</small></span></Link>
        <button className="nav-toggle icon-button" ref={menuButton} type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="main-nav" aria-expanded={menuOpen} onClick={toggleMenu}>{menuOpen ? <X /> : <Menu />}</button>
        <nav id="main-nav" className={`primary-nav ${menuOpen ? 'is-open' : ''} ${menuClosing ? 'is-closing' : ''}`} aria-label="Main navigation" inert={menuClosing ? true : undefined}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/residential">Residential</NavLink><NavLink to="/commercial">Commercial</NavLink><NavLink to="/about">About</NavLink><NavLink to="/contact">Contact</NavLink><NavLink className="nav-mobile-emergency emergency-button" to="/emergency"><Phone size={17} aria-hidden="true" /><span className="emergency-button-label">Emergency info</span></NavLink>
          <WetPaintButton className="btn btn-primary nav-mobile-request" to="/contact">Request service <ArrowRight size={16} aria-hidden="true" /></WetPaintButton>
        </nav>
        <div className="nav-cta"><Link className="nav-emergency emergency-button" to="/emergency" title="Emergency info"><Phone size={17} aria-hidden="true" /><span className="emergency-button-label">Emergency info</span></Link><WetPaintButton className="btn btn-primary" to="/contact">Request service <ArrowRight size={16} aria-hidden="true" /></WetPaintButton></div>
      </div>
      <ScrollTool />
    </header>
    <div className="site-outro-shell" ref={outroRef}>
    <main id="main" tabIndex="-1"><div className="route-surface" key={location.pathname}>{children}</div></main>
    <footer className="footer" ref={footerRef}><div className="container footer-grid">
      <div className="footer-brand"><Link to="/" className="brand"><img src={image('company-logo')} alt="" width="46" height="52" /><span className="brand-label"><strong>{brand}</strong><small>PLUMBING SERVICES</small></span></Link><p>Clear information and practical plumbing service paths for homes and businesses.</p><span className="footer-demo">Demo site · Replace placeholder business details before launch.</span></div>
      <div><h2>Explore</h2><Link to="/services">All services</Link><Link to="/residential">Residential</Link><Link to="/commercial">Commercial</Link><Link to="/about">About</Link></div>
      <div><h2>Helpful links</h2><Link to="/problem-finder">Problem finder</Link><Link to="/service-area">Service area</Link><Link to="/maintenance">Maintenance hub</Link><Link to="/projects">Project gallery</Link><Link to="/emergency">Emergency guidance</Link><Link to="/reviews">Reviews</Link><Link to="/accessibility">Accessibility</Link><Link to="/privacy">Privacy template</Link></div>
      <div><h2>Get in touch</h2><WetPaintButton className="btn btn-white footer-cta" to="/contact">Request service <ArrowRight size={16} aria-hidden="true" /></WetPaintButton><Link className="footer-contact footer-contact-link" to="/contact#contact-details" aria-label={`${phone} (demo) — view contact details`}><Phone size={16} aria-hidden="true" /> {phone} (demo)</Link><Link className="footer-contact footer-contact-link" to="/contact#contact-details" aria-label={`${email} (demo) — view contact details`}><Mail size={16} aria-hidden="true" /> {email} (demo)</Link><span className="footer-contact"><Clock3 size={16} aria-hidden="true" /> Hours to be confirmed</span></div>
    </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {brand} Plumbing Services · Demo website</span><button type="button" onClick={openAccess}>Accessibility options</button></div></footer>
    </div>
    <div className="floating-tools"><Chatbot /></div>
    {accessOpen && <AccessibilitySettings onClose={closeAccess} />}
  </AccessibilityActionsContext.Provider>;
}
