import React from 'react';
import { createRoot } from 'react-dom/client';
import BeforeAfterSlider from '../../src/components/BeforeAfterSlider.jsx';
import '../../src/creative.css';
const swatch = color => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/></svg>`)}`;
createRoot(document.getElementById('root')).render(<BeforeAfterSlider before={{src:swatch('#17355a'),alt:'Test color before'}} after={{src:swatch('#7aa9c9'),alt:'Test color after'}} description="Synthetic test colors only. Not a customer project." />);
