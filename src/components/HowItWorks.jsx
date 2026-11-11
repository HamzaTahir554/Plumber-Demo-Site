import React from 'react';
import AnimatedIcon from './AnimatedIcon.jsx';

const steps = [
  { icon: 'message', title: 'Tell us your problem', text: 'Describe what is happening so you can identify a relevant service.' },
  { icon: 'wrench', title: 'Choose your service', text: 'Review the suggested service and the information it covers.' },
  { icon: 'calendar', title: 'Set a preference', text: 'Choose a date and time in the demo request form.' },
  { icon: 'check', title: 'Review the next step', text: 'Check your details. A real booking requires a connected service.' }
];

export default function HowItWorks() {
  return <ol className="process-grid process-grid--interactive reveal" aria-label="Four steps from problem to request">
    {steps.map((step, index) => <li className="process-step" key={step.title} style={{ '--step-index': index }}>
      <article className="process-card" data-process-icon={step.icon}>
        <div className="process-card-top">
          <div className="process-step-icon"><AnimatedIcon name={step.icon} size={28} animation="none" trigger="hover" /></div>
          <span className="process-step-number" aria-hidden="true"><small>STEP</small>0{index + 1}</span>
        </div>
        <h3>{step.title}</h3><p>{step.text}</p>
        <span className="process-step-progress" aria-hidden="true" />
      </article>
    </li>)}
  </ol>;
}
