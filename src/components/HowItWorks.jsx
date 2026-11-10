import React from 'react';
import AnimatedIcon from './AnimatedIcon.jsx';

const steps = [
  { icon: 'message', animation: 'draw', title: 'Tell us your problem', text: 'Describe what is happening so you can identify a relevant service.' },
  { icon: 'wrench', animation: 'rotate', title: 'Choose your service', text: 'Review the suggested service and the information it covers.' },
  { icon: 'calendar', animation: 'check', title: 'Set a preference', text: 'Choose a date and time in the demo request form.' },
  { icon: 'check', animation: 'check', title: 'Review the next step', text: 'Check your details. A real booking requires a connected service.' }
];

export default function HowItWorks() {
  return <div className="process-grid process-grid--interactive reveal" aria-label="Four steps from problem to request">
    {steps.map((step, index) => <div className="process-step" key={step.title} style={{ '--step-index': index }}>
      <div className="process-step-icon"><AnimatedIcon name={step.icon} size={30} animation={step.animation} trigger="inView" duration={600} /></div>
      <span className="process-step-number">0{index + 1}</span>
      <h3>{step.title}</h3><p>{step.text}</p>
    </div>)}
  </div>;
}
