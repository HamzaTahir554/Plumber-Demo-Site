import React from 'react';
import { createRoot } from 'react-dom/client';
import { HotspotImage } from '../../src/components/CraftsmanshipShowcase.jsx';
import '../../src/phase-two.css';
const swatch = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#b9cee0"/></svg>')}`;
createRoot(document.getElementById('root')).render(<HotspotImage src={swatch} alt="Synthetic test swatch, not a project photograph" hotspots={[{id:'fitting',x:40,y:60,title:'Test fitting',text:'A synthetic annotation for interaction testing only.'}]} />);
