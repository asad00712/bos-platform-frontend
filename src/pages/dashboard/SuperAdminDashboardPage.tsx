import type { CSSProperties } from 'react'
import { useSessionStore } from '../../stores/session.store'
import { activities, kpis, tasks, tenants } from './dashboardData'
import { DashboardIcon } from './DashboardIcon'

const dashboardVars = {
  '--bg': '#F4F5F7',
  '--surface': '#FFFFFF',
  '--surface2': '#F8F9FB',
  '--surface3': '#EDEEF2',
  '--border': 'rgba(0,0,0,0.07)',
  '--border2': 'rgba(0,0,0,0.13)',
  '--text': '#111827',
  '--text2': '#4B5563',
  '--text3': '#9CA3AF',
  '--accent': '#4F46E5',
  '--accent2': '#7C3AED',
  '--accent-glow': 'rgba(79,70,229,0.1)',
  '--rail': '#1E1B4B',
} as CSSProperties

export function SuperAdminDashboardPage() {
  const user = useSessionStore((state) => state.user)
  const initial = user?.firstName?.[0] ?? 'A'

  return (
    <div className="app" style={dashboardVars}>
      <Rail initial={initial} />
      <Sidebar />
      <div className="main">
        <Header />
        <Tabs />
        <main className="content">
          <IntelligenceCard />
          <KpiRow />
          <div className="grid-2 section-gap">
            <RevenuePanel />
            <ActivityPanel />
          </div>
          <div className="grid-3 section-gap">
            <TasksPanel />
            <PipelinePanel />
            <VerticalRevenuePanel />
          </div>
          <TenantTablePanel />
        </main>
      </div>
    </div>
  )
}

function Rail({ initial }: { initial: string }) {
  const items = [
    ['Dashboard', 'Board', 'grid'],
    ['CRM', 'CRM', 'user'],
    ['Schedule', 'Cal', 'calendar'],
    ['Finance', 'Bills', 'money'],
    ['HRM', 'HRM', 'user'],
    ['Tasks', 'Tasks', 'chart'],
    ['Docs', 'Docs', 'grid'],
    ['Analytics', 'Data', 'chart'],
    ['Automations', 'Auto', 'money'],
    ['Support', 'Help', 'grid'],
  ]

  return (
    <aside className="rail">
      <div className="rail-logo">B</div>
      <div className="rail-nav">
        {items.map(([title, tip, icon], index) => (
          <div className={`rail-item ${index === 0 ? 'active' : ''}`} key={title} title={title}>
            <DashboardIcon name={icon} />
            <span className="rail-tip">{tip}</span>
          </div>
        ))}
      </div>
      <div className="rail-bottom">
        <div className="rail-item" title="Settings"><DashboardIcon name="grid" /></div>
        <div className="rail-avatar">{initial}</div>
      </div>
    </aside>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="sb-org">
          <div className="sb-org-icon">B</div>
          <div className="sb-org-name">BOS Demo Org</div>
          <div className="sb-org-arrow">▾</div>
        </div>
      </div>
      <div className="sb-search"><input type="text" placeholder="⌘ Search anything..." /></div>
      <SidebarSection label="Overview" items={[['Dashboard', 'grid', '', true], ['My Tasks', 'chart', '7'], ['Schedule Today', 'calendar', '']]} />
      <div className="sb-divider" />
      <SidebarSection label="Modules" add items={[['CRM', 'user', '124'], ['Invoices', 'money', '18'], ['Support', 'grid', '5'], ['Reports', 'chart', ''], ['Automations', 'money', '']]} />
      <div className="sb-divider" />
      <SidebarSection label="Verticals" add items={[['Medical Clinic', 'grid', 'Live'], ['Law Firm', 'money', 'Live'], ['Restaurant', 'grid', 'Beta'], ['School', 'grid', 'Dev']]} />
    </aside>
  )
}

function SidebarSection({
  label,
  items,
  add,
}: {
  label: string
  items: Array<[string, string, string, boolean?]>
  add?: boolean
}) {
  return (
    <div className="sb-section">
      <div className="sb-label">{label} {add && <span className="sb-label-add">+</span>}</div>
      {items.map(([name, icon, badge, active]) => (
        <div className={`sb-item ${active ? 'active' : ''}`} key={name}>
          <DashboardIcon name={icon} />
          <span className="sb-item-label">{name}</span>
          {badge && <span className="sb-badge">{badge}</span>}
        </div>
      ))}
    </div>
  )
}

function Header() {
  return (
    <header className="main-header">
      <div className="breadcrumb">
        <div className="bc-item"><DashboardIcon />BOS</div>
        <div className="bc-sep">/</div>
        <div className="bc-current"><DashboardIcon />Business Dashboard <span style={{ color: 'var(--text3)', fontSize: 11 }}>▾</span></div>
      </div>
      <div className="header-right">
        <button className="hdr-btn" type="button"><DashboardIcon name="calendar" />Apr 1 — Apr 20, 2026</button>
        <button className="hdr-btn hdr-notif" type="button"><DashboardIcon name="grid" /><div className="hdr-notif-dot" /></button>
        <button className="hdr-btn" type="button"><DashboardIcon name="chart" /></button>
        <button className="hdr-btn primary" type="button"><DashboardIcon name="money" />Quick Add</button>
      </div>
    </header>
  )
}

function Tabs() {
  return (
    <div className="tabs">
      {['Overview', 'Analytics', 'Team', 'Reports'].map((tab, index) => (
        <div className={`tab ${index === 0 ? 'active' : ''}`} key={tab}><DashboardIcon name={index === 1 ? 'chart' : 'grid'} />{tab}</div>
      ))}
      <div className="tab-sep" />
      <div className="tab-add">+ Add View</div>
    </div>
  )
}

function IntelligenceCard() {
  return (
    <section className="ai-card">
      <div className="ai-icon"><DashboardIcon name="chart" /></div>
      <div className="ai-content">
        <div className="ai-label">BOS Intelligence</div>
        <div className="ai-text">Revenue is up <strong>23% vs last month</strong>, driven by the Medical Clinic vertical. However, <strong>4 invoices totalling $12,400</strong> are overdue by 30+ days. Law Firm vertical shows <strong>declining client activity</strong> — 3 cases with no updates in 7 days.</div>
        <div className="ai-actions">
          <button className="ai-btn primary" type="button">Review Overdue Invoices</button>
          <button className="ai-btn" type="button">Law Firm Pipeline →</button>
          <button className="ai-btn" type="button">Dismiss</button>
        </div>
      </div>
    </section>
  )
}

function KpiRow() {
  return (
    <section className="kpi-row section-gap">
      {kpis.map((kpi) => (
        <article className="kpi-card" key={kpi.label} style={{ '--card-color': kpi.color, '--card-bg': kpi.bg } as CSSProperties}>
          <div className="kpi-top">
            <div className="kpi-icon"><DashboardIcon name="money" /></div>
            <div className={`kpi-trend ${kpi.trendClass}`}>{kpi.trend}</div>
          </div>
          <div className="kpi-value">{kpi.value}</div>
          <div className="kpi-label">{kpi.label}</div>
          <div className="kpi-sub">{kpi.sub}</div>
        </article>
      ))}
    </section>
  )
}

function RevenuePanel() {
  return (
    <section className="panel">
      <PanelHead title="Revenue by Week" action="This Month ▾" />
      <div className="panel-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>$84,320</div><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>April 2026 Revenue</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>+$15,720</div><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>vs March 2026</div></div>
        </div>
        <div className="bar-chart">
          {[55, 70, 45, 88, 30].map((height, index) => (
            <div className="bar-wrap" style={index === 4 ? { opacity: 0.4 } : undefined} key={height}>
              <div className="bar-col primary" style={{ height: `${height}%` }} />
              <div className="bar-label">W{index + 1}{index === 3 ? ' ▲' : ''}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--accent)' }} />Revenue</div>
          <div className="legend-item" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>W5 = in progress</div>
        </div>
      </div>
    </section>
  )
}

function ActivityPanel() {
  return (
    <section className="panel">
      <PanelHead title="Recent Activity" action="View all →" />
      <div className="panel-body" style={{ padding: '0 18px' }}>
        <div className="activity-list">
          {activities.map(([bg, color, text, time]) => (
            <div className="activity-item" key={text}>
              <div className="activity-dot" style={{ background: bg }}><DashboardIcon name="grid" /></div>
              <div className="activity-text">
                <div className="activity-main" style={{ color }}>{text}</div>
                <div className="activity-time">{time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TasksPanel() {
  return (
    <section className="panel">
      <PanelHead title="Open Tasks" action="View all →" />
      <div className="panel-body" style={{ padding: '0 18px' }}>
        <div className="task-list">
          {tasks.map(([check, name, status, pill, due, color, initial]) => (
            <div className="task-item" key={name}>
              <div className={`task-check ${check}`} />
              <div className="task-name-text">{name}</div>
              <div className="task-meta">
                <div className={`task-pill ${pill}`}>{status}</div>
                <div className="task-due">{due}</div>
                <div className="task-assignee" style={{ background: color }}>{initial}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PipelinePanel() {
  return (
    <section className="panel">
      <PanelHead title="Sales Pipeline" action="CRM →" />
      <div className="panel-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Total pipeline value</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>$218,500</div>
        </div>
        <div className="pipeline-row">
          <div className="pipeline-seg" style={{ flex: 3, background: 'var(--accent)', opacity: 0.9 }} />
          <div className="pipeline-seg" style={{ flex: 2, background: 'var(--purple)' }} />
          <div className="pipeline-seg" style={{ flex: 1.5, background: 'var(--amber)' }} />
          <div className="pipeline-seg" style={{ flex: 1, background: 'var(--green)' }} />
        </div>
        <div className="pipeline-stages">
          {['Prospect', 'Proposal', 'Negotiation', 'Won'].map((stage, index) => (
            <div className="pipeline-stage" key={stage}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: ['var(--accent)', 'var(--purple)', 'var(--amber)', 'var(--green)'][index], flexShrink: 0 }} />
              <div className="stage-label" style={{ color: 'var(--text2)' }}>{stage}</div>
              <div className="stage-count">{[12, 7, 4, 3][index]}</div>
              <div className="stage-bar-wrap"><div className="stage-bar" style={{ width: `${[100, 68, 48, 34][index]}%`, background: ['var(--accent)', 'var(--purple)', 'var(--amber)', 'var(--green)'][index] }} /></div>
              <div className="stage-val">{['$90,000', '$62,000', '$44,500', '$22,000'][index]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VerticalRevenuePanel() {
  return (
    <section className="panel">
      <PanelHead title="Revenue by Vertical" action="Details →" />
      <div className="panel-body">
        <div className="donut-wrap" style={{ marginBottom: 16 }}>
          <div className="donut-ring"><div className="donut-center"><div className="donut-val">5</div><div className="donut-sub">verticals</div></div></div>
          <div className="donut-legend">
            {['Medical 42%', 'Law Firm 21%', 'Restaurant 17%', 'Gym 12%'].map((item, index) => (
              <div className="donut-leg-item" key={item}>
                <div className="donut-leg-dot" style={{ background: ['var(--accent)', 'var(--purple)', 'var(--green)', 'var(--amber)'][index] }} />
                <div className="donut-leg-label">{item.split(' ').slice(0, -1).join(' ')}</div>
                <div className="donut-leg-val">{item.split(' ').at(-1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TenantTablePanel() {
  return (
    <section className="panel">
      <PanelHead title="Recent Tenants & Clients" action="View all →" />
      <div className="panel-body" style={{ padding: 0 }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Vertical</th><th>Status</th><th>Value</th></tr></thead>
          <tbody>
            {tenants.map(([name, vertical, status, value, color, initial]) => (
              <tr key={name}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="tbl-avatar" style={{ background: color }}>{initial}</div><span className="tbl-name">{name}</span></div></td>
                <td><span className="tag" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>{vertical}</span></td>
                <td><span className={`kpi-trend ${status === 'Overdue' ? 'down' : 'up'}`} style={{ fontSize: 10, padding: '2px 6px' }}>{status}</span></td>
                <td style={{ fontWeight: 600, color: status === 'Overdue' ? 'var(--red)' : 'var(--text)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PanelHead({ title, action }: { title: string; action: string }) {
  return (
    <div className="panel-head">
      <div className="panel-title"><DashboardIcon name="chart" />{title}</div>
      <button className="panel-action" type="button">{action}</button>
    </div>
  )
}
