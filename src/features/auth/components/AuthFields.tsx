import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { EyeIcon } from './AuthIcons'

type TextFieldProps = {
  label: string
  required?: boolean
  icon: ReactNode
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({
  label,
  required,
  icon,
  error,
  type,
  ...props
}, ref) {
  return (
    <div className="field">
      {label && (
        <label>
          {label} {required && <span>*</span>}
        </label>
      )}
      <div className="input-wrap">
        {icon}
        <input ref={ref} className={error ? 'error' : undefined} type={type} {...props} />
        {type === 'password' && (
          <div className="pw-toggle" aria-hidden="true">
            <EyeIcon />
          </div>
        )}
      </div>
      {error && <div className="field-error react-show">{error}</div>}
    </div>
  )
})

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return (
    <div className="api-error" role="alert">
      {message}
    </div>
  )
}
