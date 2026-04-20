import { Link } from 'react-router'
import { AuthBrandPanel } from '../components/AuthBrandPanel'
import { ArrowIcon, CheckIcon } from '../components/AuthIcons'

export function ResetPasswordDonePage() {
  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow="All done"
          headline={<>You&apos;re back<br />in <span>business</span></>}
          description="Your password has been updated. You can now sign in with your new credentials."
        />
        <div className="right-panel">
          <div className="form-card" style={{ maxWidth: 400, textAlign: 'center' }}>
            <div className="success-card">
              <div className="success-icon"><CheckIcon /></div>
              <div className="success-title">Password updated!</div>
              <div className="success-text">Your new password is set. Sign in to get back to your BOS dashboard.</div>
            </div>
            <Link className="submit-btn" to="/login">
              <ArrowIcon />
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
