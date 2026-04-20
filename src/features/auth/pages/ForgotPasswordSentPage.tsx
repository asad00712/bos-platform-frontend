import { Link, useSearchParams } from 'react-router'
import { AuthBrandPanel } from '../components/AuthBrandPanel'
import { ArrowIcon, MailIcon } from '../components/AuthIcons'

export function ForgotPasswordSentPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? 'you@company.com'

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="Email sent"
          headline={<>Check your<br /><span>inbox</span></>}
          description="A reset link has been sent. Click it to set a new password securely."
        />
        <div className="right-panel">
          <div className="form-card" style={{ maxWidth: 400, textAlign: 'center' }}>
            <div className="success-card">
              <div className="success-icon"><MailIcon /></div>
              <div className="success-title">Reset link sent!</div>
              <div className="success-text">We sent a link to <span className="success-email">{email}</span>. Click it to reset your password.</div>
            </div>
            <Link className="submit-btn" to="/reset-password">
              I got the email — Set new password
              <ArrowIcon />
            </Link>
            <div className="bottom-link" style={{ marginTop: 16 }}>
              Didn&apos;t get it? <Link to="/forgot-password">Try again</Link> · <Link to="/login">Back to login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
