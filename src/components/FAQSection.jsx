import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';

export default function FAQSection({ items, searchable = true }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const id = useId();
  const categories = useMemo(() => ['All', ...new Set(items.map(item => item.category).filter(Boolean))], [items]);
  const matches = items.filter(item => (category === 'All' || item.category === category) && `${item.q} ${item.a}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="faq-system">
    {searchable && <div className="faq-controls"><label htmlFor={id}>Search questions and answers</label><div className="faq-search"><Search size={18} aria-hidden="true" /><input id={id} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="For example, water heater" />{query && <button type="button" onClick={() => { setQuery(''); document.getElementById(id)?.focus(); }}>Clear</button>}</div>
      {categories.length > 1 && <><div className="faq-categories" aria-label="FAQ categories">{categories.map(name => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div><label className="faq-mobile-category"><span id={`${id}-category`}>Category</span><select aria-labelledby={`${id}-category`} value={category} onChange={event => setCategory(event.target.value)}>{categories.map(name => <option key={name}>{name}</option>)}</select></label></>}
      <p className="faq-count" role="status">{matches.length} {matches.length === 1 ? 'answer' : 'answers'} found</p></div>}
    <div className="faq-list">{matches.map(item => <details key={`${item.category || ''}-${item.q}`}><summary>{item.q}<Plus size={18} aria-hidden="true" /></summary><div className="faq-answer"><p>{item.a}</p>{item.href && <Link className="text-link" to={item.href}>{item.linkText || 'Explore this service'} →</Link>}</div></details>)}</div>
    {!matches.length && <div className="faq-empty"><p>No matching answers. Try another phrase or category.</p><button type="button" className="btn btn-outline" onClick={() => { setQuery(''); setCategory('All'); }}>Show all answers</button><Link className="text-link" to="/problem-finder">Try the problem finder →</Link></div>}
  </div>;
}
