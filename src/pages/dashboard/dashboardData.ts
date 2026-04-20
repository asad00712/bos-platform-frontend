export const kpis = [
  {
    color: '#6366F1',
    bg: 'var(--accent-glow)',
    trend: '↑ 23%',
    trendClass: 'up',
    value: '$84,320',
    label: 'Total Revenue (Apr)',
    sub: 'vs $68,600 last month',
  },
  {
    color: '#22C55E',
    bg: 'var(--green-bg)',
    trend: '↑ 12%',
    trendClass: 'up',
    value: '248',
    label: 'Active Clients',
    sub: '14 new this week',
  },
  {
    color: '#F59E0B',
    bg: 'var(--amber-bg)',
    trend: '↑ 8%',
    trendClass: 'up',
    value: '193',
    label: 'Appointments (Apr)',
    sub: '12 today, 3 pending confirm',
  },
  {
    color: '#F87171',
    bg: 'var(--red-bg)',
    trend: '↑ $12.4k',
    trendClass: 'down',
    value: '$12,400',
    label: 'Overdue Invoices',
    sub: '4 invoices, avg 38 days late',
  },
]

export const activities = [
  ['var(--green-bg)', 'var(--green)', 'Invoice #INV-2026-184 paid by Sarah M. — $3,200', '2 mins ago'],
  ['var(--blue-bg)', 'var(--blue)', 'New appointment booked — Dr. Ahmed at 3:00 PM', '14 mins ago'],
  ['var(--purple-bg)', 'var(--purple)', 'New lead added — Al-Rashid Law (₹18k potential)', '1 hr ago'],
  ['var(--amber-bg)', 'var(--amber)', 'Support ticket #TKT-089 escalated — SLA breach risk', '2 hrs ago'],
  ['var(--red-bg)', 'var(--red)', 'Invoice #INV-2026-141 overdue by 32 days — $4,100', '3 hrs ago'],
]

export const tasks = [
  ['ip', 'Follow up: Al-Noor Clinic contract', 'In Progress', 'pill-ip', 'Today', '#6366F1', 'A'],
  ['todo', 'Review Q1 payroll — Medical Clinic', 'Urgent', 'pill-urgent', 'Apr 22', '#22C55E', 'S'],
  ['todo', 'Configure Restaurant vertical — POS', 'To Do', 'pill-todo', 'Apr 25', '#F59E0B', 'M'],
  ['done', 'Onboard Karachi Law Firm', 'Done', 'pill-done', 'Apr 18', '#8B5CF6', 'R'],
  ['ip', 'Build School vertical admissions module', 'In Progress', 'pill-ip', 'Apr 30', '#3B82F6', 'K'],
]

export const tenants = [
  ['Al-Noor Clinic', 'Medical', 'Active', '$3,200', '#6366F1', 'A'],
  ['Al-Rashid Law', 'Law', 'Lead', '$18,000', '#8B5CF6', 'A'],
  ['Khan Gym', 'Gym', 'Active', '$1,800', '#F59E0B', 'K'],
  ['Zafar Clinic', 'Medical', 'Overdue', '$4,100', '#F87171', 'Z'],
  ['Biryani House', 'Restaurant', 'Beta', '$950', '#22C55E', 'B'],
]
