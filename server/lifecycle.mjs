export const statuses = ['submitted', 'under_review', 'awaiting_customer', 'scheduled', 'in_progress', 'completed', 'cancelled'];
const transitions = {
  submitted: ['under_review', 'awaiting_customer', 'scheduled', 'cancelled'],
  under_review: ['awaiting_customer', 'scheduled', 'cancelled'],
  awaiting_customer: ['under_review', 'scheduled', 'cancelled'],
  scheduled: ['under_review', 'awaiting_customer', 'in_progress', 'cancelled'],
  in_progress: ['awaiting_customer', 'completed', 'cancelled'],
  completed: [], cancelled: []
};
export function canTransition(from, to, role, reason) {
  if (!statuses.includes(to)) return false;
  if (from === to) return true; // A reschedule / customer update is still an audited event.
  if (['completed', 'cancelled'].includes(from)) return role === 'admin' && reason.trim().length >= 10;
  return transitions[from]?.includes(to) || false;
}
