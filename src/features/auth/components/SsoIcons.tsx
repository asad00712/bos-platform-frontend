/**
 * Brand SVGs for SSO buttons. Inline so we don't take a network hit and
 * so they tint correctly with `currentColor` where appropriate. Google
 * uses its four-color logo; Microsoft uses its four-square logo.
 */

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EA4335"
        d="M12 5.04c1.94 0 3.69.67 5.07 1.97l3.78-3.78C18.6 1.13 15.55 0 12 0 7.31 0 3.26 2.69 1.28 6.61l4.41 3.42C6.74 7.07 9.13 5.04 12 5.04z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.78-2.4 3.63l3.84 2.98c2.25-2.08 3.6-5.16 3.6-8.79z"
      />
      <path
        fill="#FBBC05"
        d="M5.69 14.2a7.2 7.2 0 0 1 0-4.56L1.28 6.22A12.01 12.01 0 0 0 0 12c0 1.94.46 3.78 1.28 5.42l4.41-3.42z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.84-2.98c-1.07.72-2.45 1.14-4.11 1.14-3.16 0-5.84-2.13-6.79-5l-4.41 3.42C2.94 21.31 7.06 24 12 24z"
      />
    </svg>
  )
}

export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  )
}
