import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { projectStories, isPublishedStory, storyImage } from '../data/projectStories.js';
import { featuredComparison } from '../data/projectComparisons.js';
import BeforeAfterSlider from './BeforeAfterSlider.jsx';

function StoryPhoto({ photo, responsive = false, ...props }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="story-image-error" role="status">Photograph unavailable. The story details remain below.</span> : <img {...storyImage(photo, responsive)} {...props} onError={() => setFailed(true)} />;
}

export function ProjectStoryDialog({ stories, index, onNavigate, onClose, opener }) {
  const dialog = useRef(null);
  const back = useRef(null);
  const id = useId();
  const story = stories[index];
  const published = isPublishedStory(story);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    const y = window.scrollY;
    const modal = dialog.current;
    // Reserve only a real scrollbar; overlay-scrollbar browsers need no new gutter.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    modal.showModal();
    back.current.focus({ preventScroll: true });
    return () => {
      modal.close();
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      opener.current?.focus({ preventScroll: true });
      window.scrollTo({ top: y, behavior: 'instant' });
    };
  }, [opener]);
  function keys(event) {
    if (event.key === 'Tab') {
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape') event.stopPropagation();
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); onNavigate(event.key === 'ArrowRight' ? 1 : -1); }
  }
  return createPortal(<dialog className="story-dialog" ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-notice`} onKeyDown={keys} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="story-dialog-header"><button ref={back} type="button" className="story-back" onClick={onClose}><ArrowLeft size={18} aria-hidden="true" />Back to stories</button><button type="button" className="story-close" aria-label="Close project story" onClick={onClose}><X aria-hidden="true" /></button></header>
    <div className="story-dialog-body" key={story.id}>
      <div className="story-dialog-layout"><figure className="story-dialog-photo"><StoryPhoto photo={story.photo} /><figcaption id={`${id}-notice`}>{published ? 'Approved project photography.' : 'Portfolio preview · Illustrative imagery, not a completed company project.'}</figcaption></figure>
        <div className="story-dialog-copy"><span className="eyebrow">{story.category}</span><h2 id={`${id}-title`}>{story.title}</h2><p className="story-intro">{story.summary}</p>
          <section><span className="story-step" aria-hidden="true">01</span><div><h3>The Challenge</h3><p>{published ? story.challenge : 'The project-specific issue and initial assessment have not been supplied.'}</p></div></section>
          <section><span className="story-step" aria-hidden="true">02</span><div><h3>Our Approach</h3><p>{published ? story.approach : 'Verified details of the work performed, methods and materials are pending.'}</p></div></section>
          <section><span className="story-step" aria-hidden="true">03</span><div><h3>The Result</h3><p>{published ? story.result : 'No completed outcome is documented for this preview. Results will appear only after verification.'}</p></div></section>
        </div></div>
      {published && story.comparison && <div className="story-dialog-comparison"><h3>Before &amp; after</h3><BeforeAfterSlider {...story.comparison} /></div>}
    </div>
    <footer className="story-dialog-footer"><span role="status">{index + 1} / {stories.length} · {published ? 'Project story' : 'Preview story'}</span><div><button type="button" className="story-pagination" aria-label="Previous project story" onClick={() => onNavigate(-1)}><ArrowLeft aria-hidden="true" /></button><button type="button" className="story-pagination" aria-label="Next project story" onClick={() => onNavigate(1)}><ArrowRight aria-hidden="true" /></button></div></footer>
  </dialog>, document.body);
}

export default function ProjectStories({ stories = projectStories }) {
  const [active, setActive] = useState(null);
  const opener = useRef(null);
  const allPublished = stories.length > 0 && stories.every(isPublishedStory);
  return <section className="section project-stories" id="project-stories" aria-labelledby="stories-title"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">PROJECT STORIES</span><h2 id="stories-title">{allPublished ? 'Real Work. Lasting Results.' : 'Every project has a story.'}</h2><p>{allPublished ? 'Explore the details behind our plumbing projects, from the challenges encountered to the solutions delivered.' : 'Preview how future projects will be documented, from the initial challenge to the approach and verified result. The images below are illustrative.'}</p></div><span className="stories-status">{allPublished ? 'Documented work' : 'Portfolio preview'}</span></div>
    <div className="stories-grid">{stories.map((story, index) => {
      const published = isPublishedStory(story);
      return <article className="story-card reveal" key={story.id} style={{ '--story-order': index }}>
        <button className="story-open" type="button" aria-haspopup="dialog" onClick={event => { opener.current = event.currentTarget; setActive(index); }}>
          <span className="story-card-photo"><StoryPhoto photo={story.photo} responsive sizes="(max-width:680px) calc(100vw - 36px), (max-width:1024px) 60vw, 55vw" loading="lazy" decoding="async" /><span className="story-photo-label">{published ? 'Documented project' : 'Preview · Illustrative image'}</span></span>
          <span className="story-card-copy"><span className="story-category">{story.category}</span><strong>{story.title}</strong><span className="story-summary">{story.summary}</span><span className="story-card-action">{published ? 'Read the story' : 'Explore the preview'}<ArrowRight size={19} aria-hidden="true" /></span></span>
        </button>
      </article>;
    })}</div>
    <p className="stories-note">{allPublished ? 'Explore the details, then plan your next step.' : 'Genuine project photography and approved work details are needed before these previews become company project stories.'} <Link to="/contact#faq">Service questions &amp; answers</Link></p>
    <div className="story-comparison"><BeforeAfterSlider {...(featuredComparison || {})} /></div>
    {active !== null && <ProjectStoryDialog stories={stories} index={active} onNavigate={direction => setActive(current => (current + direction + stories.length) % stories.length)} onClose={() => setActive(null)} opener={opener} />}
  </div></section>;
}
