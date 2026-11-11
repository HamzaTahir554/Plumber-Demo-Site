import React, { Suspense, lazy } from 'react';
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

const Services = lazy(() => import('./pages/Services.jsx'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'));
const InfoPages = lazy(() => import('./pages/InfoPages.jsx'));
const ProblemFinder = lazy(() => import('./pages/ProblemFinder.jsx'));
const ServiceArea = lazy(() => import('./pages/ServiceArea.jsx'));
const ProjectGallery = lazy(() => import('./pages/ProjectGallery.jsx'));
const MaintenanceHub = lazy(() => import('./pages/MaintenanceHub.jsx'));

function App() {
  return <BrowserRouter><SiteLayout><Suspense fallback={<div className="page-loading container" role="status">Loading page…</div>}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/services/:slug" element={<ServiceDetail />} />
    <Route path="/problem-finder" element={<ProblemFinder />} />
    <Route path="/service-area" element={<ServiceArea />} />
    <Route path="/projects" element={<ProjectGallery />} />
    <Route path="/maintenance" element={<MaintenanceHub />} />
    <Route path="/:page" element={<InfoPages />} />
  </Routes></Suspense></SiteLayout></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<App />);
