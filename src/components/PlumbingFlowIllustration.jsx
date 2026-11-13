import React, { useState } from 'react';

const captions = {
  flow: ['A clear path for water', 'A simplified view of water traveling through connected pipes.'],
  leak: ['Finding the source', 'Inspection helps locate a leak before an appropriate repair is planned.'],
  drain: ['Restoring a flow path', 'A simplified restriction and clearing sequence. Actual methods depend on the pipe and obstruction.'],
  heater: ['From cold supply to hot outlet', 'Cold supply enters the tank; heating raises the water temperature before hot water leaves. Schematic only.']
};
export default function PlumbingFlowIllustration({ type = 'flow' }) {
  const [run, setRun] = useState(0);
  const [title, text] = captions[type] || captions.flow;
  return <figure className={`plumbing-diagram diagram-${type}`}><svg key={run} className={run ? 'is-playing' : ''} viewBox="0 0 360 180" role="img" aria-label={title}>
    {type === 'heater' ? <><rect x="130" y="28" width="100" height="128" rx="20" className="diagram-pipe" /><path d="M50 30H150V125M210 45H310" className="diagram-pipe" /><path d="M50 30H150V125" className="diagram-flow" /><path d="M210 45H310" className="diagram-hot" /><path d="M155 110q12-20 25 0t25 0M155 125q12-20 25 0t25 0" className="diagram-heat" /><text x="40" y="17">Cold supply</text><text x="255" y="30">Hot outlet</text></> : <><path d="M30 65H140Q165 65 165 90V110Q165 135 190 135H330" className="diagram-pipe" /><path d="M30 65H140Q165 65 165 90V110Q165 135 190 135H330" className="diagram-flow" />{type === 'leak' && <><circle cx="165" cy="96" r="18" className="diagram-inspect" /><path d="M190 103q-14 18 0 18q14 0 0-18" className="diagram-drop" /><text x="212" y="102">Inspect source</text></>}{type === 'drain' && <><path d="M153 88l24 8-24 9 24 8" className="diagram-blockage" /><text x="30" y="160">Restriction → clearing → flow</text></>}</>}
  </svg><figcaption><h3>{title}</h3><p>{text}</p><button className="text-link" type="button" onClick={() => setRun(value => value + 1)}>Play illustration <span aria-hidden="true">→</span></button></figcaption></figure>;
}
