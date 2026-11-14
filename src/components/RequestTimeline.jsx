import React from 'react';
import { CheckCircle2, ClipboardList, Clock3, CircleAlert, CalendarCheck, Wrench, XCircle } from 'lucide-react';
import { requestStatuses, displayTime } from '../data/requestStatuses.js';

const icons = { submitted: ClipboardList, under_review: Clock3, awaiting_customer: CircleAlert, scheduled: CalendarCheck, in_progress: Wrench, completed: CheckCircle2, cancelled: XCircle };
export default function RequestTimeline({ events }) {
  return <ol className="request-timeline" aria-label="Recorded request history">{events.map((event, index) => {
    const status = requestStatuses[event.status], Icon = icons[event.status] || ClipboardList;
    return <li key={event.id} style={{ '--event-delay': `${Math.min(index, 5) * 70}ms` }} aria-current={index === events.length - 1 ? 'step' : undefined}>
      <span className="request-event-icon"><Icon size={20} aria-hidden="true" /></span><div><h3>{status?.label || event.status}</h3><time dateTime={event.created_at}>{displayTime(event.created_at)}</time>{event.message && <p>{event.message}</p>}{event.appointment && <p>Appointment: {displayTime(event.appointment)}</p>}{index === events.length - 1 && <span className="request-current">Latest recorded event</span>}</div>
    </li>;
  })}</ol>;
}
