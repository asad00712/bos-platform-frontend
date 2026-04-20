import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  FileWarning,
  HeartPulse,
  Stethoscope,
  UsersRound,
} from 'lucide-react'
import { useSessionStore } from '../../stores/session.store'
import { getVerticalTheme } from '../../themes/verticals'

const kpis = [
  {
    label: 'Today revenue',
    value: 'Rs 184,500',
    delta: '+12.4%',
    icon: CreditCard,
  },
  {
    label: 'Patient visits',
    value: '42',
    delta: '31 checked in',
    icon: UsersRound,
  },
  {
    label: 'Avg wait time',
    value: '11m',
    delta: '-4m vs yesterday',
    icon: Activity,
  },
  {
    label: 'Open invoices',
    value: '18',
    delta: 'Rs 92,300 due',
    icon: FileWarning,
  },
]

const appointments = [
  {
    time: '09:30',
    patient: 'Ayesha Khan',
    service: 'General consultation',
    doctor: 'Dr. Sana Malik',
    state: 'Checked in',
  },
  {
    time: '10:15',
    patient: 'Bilal Ahmed',
    service: 'Follow-up visit',
    doctor: 'Dr. Omar Farooq',
    state: 'Waiting',
  },
  {
    time: '11:00',
    patient: 'Noor Fatima',
    service: 'Lab review',
    doctor: 'Dr. Sana Malik',
    state: 'Room 2',
  },
  {
    time: '12:30',
    patient: 'Hamza Ali',
    service: 'Prescription renewal',
    doctor: 'Dr. Omar Farooq',
    state: 'Confirmed',
  },
]

const careQueue = [
  '7 lab results require doctor review',
  '3 unsigned SOAP notes from yesterday',
  '5 prescriptions ready for patient pickup',
  '2 consent forms missing signatures',
]

export function ClinicDashboardPage() {
  const tenant = useSessionStore((state) => state.tenant)
  const theme = getVerticalTheme(tenant.vertical)

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">{theme.terminology.primaryWorkspace}</p>
          <h1>{tenant.name} command center</h1>
          <p>
            A medical-first operating view for patient flow, billing, clinical
            work, and operational risk.
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" type="button">
            <CalendarClock size={17} aria-hidden="true" />
            <span>Book appointment</span>
          </button>
          <button className="primary-button" type="button">
            <Stethoscope size={17} aria-hidden="true" />
            <span>New patient</span>
          </button>
        </div>
      </section>

      <section className="kpi-grid" aria-label="Clinic KPIs">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <article className="metric-card" key={kpi.label}>
              <div>
                <p>{kpi.label}</p>
                <strong>{kpi.value}</strong>
                <small>{kpi.delta}</small>
              </div>
              <span className="metric-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
            </article>
          )
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel span-2">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live schedule</p>
              <h2>Today&apos;s appointments</h2>
            </div>
            <button className="text-button" type="button">
              View calendar
              <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <div className="appointment-row" key={`${appointment.time}-${appointment.patient}`}>
                <time>{appointment.time}</time>
                <div>
                  <strong>{appointment.patient}</strong>
                  <span>{appointment.service}</span>
                </div>
                <span>{appointment.doctor}</span>
                <mark>{appointment.state}</mark>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Clinical risk</p>
              <h2>Care queue</h2>
            </div>
            <HeartPulse size={22} aria-hidden="true" />
          </div>
          <ul className="care-list">
            {careQueue.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel span-2">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Workflow health</p>
              <h2>Foundation readiness</h2>
            </div>
          </div>
          <div className="readiness-grid">
            <ReadinessItem label="Auth contract" value="Aligned" />
            <ReadinessItem label="Tenant context" value="Modeled" />
            <ReadinessItem label="Vertical terms" value="Active" />
            <ReadinessItem label="RBAC UI" value="Prepared" />
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Owner focus</p>
              <h2>Next decisions</h2>
            </div>
          </div>
          <div className="decision-list">
            <button type="button">Approve two staff leave requests</button>
            <button type="button">Review unpaid invoices over 30 days</button>
            <button type="button">Assign lab review backlog</button>
          </div>
        </article>
      </section>
    </div>
  )
}

function ReadinessItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="readiness-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
