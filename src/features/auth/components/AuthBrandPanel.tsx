import type { ReactNode } from 'react'

type AuthBrandPanelProps = {
  eyebrow: string
  headline: ReactNode
  description: string
  features?: ReactNode
  stats?: Array<{ value: string; label: string }>
}

export function AuthBrandPanel({
  eyebrow,
  headline,
  description,
  features,
  stats,
}: AuthBrandPanelProps) {
  return (
    <div className="left-panel">
      <div className="lp-logo">
        <div className="lp-logo-icon">B</div>
        <div>
          <div className="lp-logo-name">BOS</div>
          <div className="lp-logo-tag">Business Operating System</div>
        </div>
      </div>
      <div className="lp-content">
        <div className="lp-eyebrow">{eyebrow}</div>
        <div className="lp-headline">{headline}</div>
        <div className="lp-desc">{description}</div>
      </div>
      {features && <div className="lp-features">{features}</div>}
      {stats && (
        <div className="lp-stats">
          {stats.map((stat) => (
            <div className="lp-stat" key={stat.label}>
              <div className="lp-stat-val">{stat.value}</div>
              <div className="lp-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AuthFeature({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="lp-feature">
      <div className="lp-feature-icon">{icon}</div>
      <div className="lp-feature-text">{children}</div>
    </div>
  )
}
