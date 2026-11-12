import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import './style.css';
import './refinement.css';
import './features.css';
import './motion.css';
import './hero.css';
import './banner.css';
import './interactions.css';
import './floating.css';
import './polish.css';
import './outro.css';
import './wet-paint.css';
import './glass-interactions.css';
import './story-motion.css';

import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import InfoPages from './pages/InfoPages.jsx';
import ProblemFinder from './pages/ProblemFinder.jsx';
import ServiceArea from './pages/ServiceArea.jsx';
import ProjectGallery from './pages/ProjectGallery.jsx';
import MaintenanceHub from './pages/MaintenanceHub.jsx';

function App() {
  return <BrowserRouter><SiteLayout><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/services/:slug" element={<ServiceDetail />} />
    <Route path="/problem-finder" element={<ProblemFinder />} />
    <Route path="/service-area" element={<ServiceArea />} />
    <Route path="/projects" element={<ProjectGallery />} />
    <Route path="/maintenance" element={<MaintenanceHub />} />
    <Route path="/:page" element={<InfoPages />} />
  </Routes></SiteLayout></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<App />);
