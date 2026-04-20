type DashboardIconProps = {
  name?: string
}

export function DashboardIcon({ name = 'grid' }: DashboardIconProps) {
  if (name === 'user') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 16 16">
        <circle cx="8" cy="5.5" r="3" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 16 16">
        <rect x="2" y="3" width="12" height="11" rx="1.5" />
        <path d="M5.5 2v2M10.5 2v2M2 7h12" />
      </svg>
    )
  }

  if (name === 'money') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 16 16">
        <path d="M2 12V5a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1z" />
        <path d="M8 7v4M6 9h4" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 16 16">
        <path d="M2 13l4-5 3 3 4-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 16 16">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
    </svg>
  )
}
