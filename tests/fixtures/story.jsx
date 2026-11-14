import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ProjectStories from '../../src/components/ProjectStories.jsx';
import useReveal from '../../src/hooks/useReveal.js';
import '../../src/style.css';
import '../../src/refinement.css';
import '../../src/creative.css';
import '../../src/project-stories.css';
const swatch=color=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/></svg>`)}`;
const before={src:swatch('#17355a'),alt:'Synthetic comparison test before'};
const after={src:swatch('#7aa9c9'),alt:'Synthetic comparison test after'};
const sample={status:'published',category:'Test fixture only',summary:'Synthetic fixture, never a customer project.',photo:{...before,width:1200,height:800,verified:true},challenge:'Test challenge text.',approach:'Test approach text.',result:'Test result text.',comparison:{before,after,description:'Synthetic test colors only.'}};
function App(){useReveal();return <BrowserRouter><main><ProjectStories stories={[{...sample,id:'test-a',title:'Synthetic story A'},{...sample,id:'test-b',title:'Synthetic story B'}]} /></main></BrowserRouter>;}
createRoot(document.getElementById('root')).render(<App/>);
