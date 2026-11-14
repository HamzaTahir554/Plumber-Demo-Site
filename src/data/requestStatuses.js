export const requestStatuses = {
  submitted: { label: 'Request Received', text: 'Your details are recorded. A preferred visit is not yet confirmed.' },
  under_review: { label: 'Under Review', text: 'Staff are reviewing the request and service requirements.' },
  awaiting_customer: { label: 'Action Required', text: 'Read the latest update and contact the team with the requested information.' },
  scheduled: { label: 'Appointment Scheduled', text: 'Staff have recorded an appointment. Check the date and time below.' },
  in_progress: { label: 'Service In Progress', text: 'Staff have marked the service as in progress.' },
  completed: { label: 'Completed', text: 'Staff have marked this request complete.' },
  cancelled: { label: 'Cancelled', text: 'This request has been cancelled. Contact the team if you need help.' }
};
export const displayTime = value => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not set';
