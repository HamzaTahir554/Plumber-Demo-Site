import React from 'react';
export default function LiquidSectionDivider({ subtle = false }) {
  return <svg className={`liquid-divider ${subtle ? 'liquid-divider--subtle' : ''}`} viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 25C240 0 360 40 720 20S1200 0 1440 20V40H0Z" /><path className="waterline" d="M0 25C240 0 360 40 720 20S1200 0 1440 20" pathLength="1" /></svg>;
}
