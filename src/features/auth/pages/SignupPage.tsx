import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { authApi } from '../../../api/auth.api'
import type { VerticalType } from '../../../types/tenant'
import { AuthBrandPanel, AuthFeature } from '../components/AuthBrandPanel'
import { ArrowIcon, BackIcon, BuildingIcon, CheckIcon, GoogleIcon, LockIcon, MailIcon, UserIcon } from '../components/AuthIcons'
import { FormError, TextField } from '../components/AuthFields'

const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(60),
  lastName: z.string().trim().max(60).optional(),
  email: z.email('Enter a valid work email.').max(255),
  password: z.string()
    .min(10, 'Use at least 10 characters.')
    .max(128)
    .regex(/[a-z]/, 'Add at least one lowercase letter.')
    .regex(/[A-Z]/, 'Add at least one uppercase letter.')
    .regex(/[0-9]/, 'Add at least one number.'),
  orgName: z.string().trim().min(2, 'Organization name is required.').max(120),
  orgSlug: z.string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Use lowercase letters, numbers, and hyphens.'),
  vertical: z.enum(['medical', 'law', 'restaurant', 'school', 'gym']),
})

type SignupForm = z.infer<typeof signupSchema>
type SignupStep = 1 | 2 | 3

const verticalOptions: Array<{ label: string; value: VerticalType }> = [
  { label: 'Medical', value: 'medical' },
  { label: 'Law', value: 'law' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'School', value: 'school' },
  { label: 'Gym', value: 'gym' },
]

export function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<SignupStep>(1)
  const [stepMessage, setStepMessage] = useState<string | null>(null)

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      orgName: '',
      orgSlug: '',
      vertical: 'medical',
    },
  })

  const selectedVertical = useWatch({ control: form.control, name: 'vertical' })
  const reviewValues = useWatch({ control: form.control })

  const signup = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (result, values) => {
      if (result.devVerificationUrl) {
        const url = new URL(result.devVerificationUrl)
        navigate(`${url.pathname}${url.search}&email=${encodeURIComponent(values.email)}`)
        return
      }

      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`)
    },
  })

  const submitSignup = (values: SignupForm) => {
    signup.mutate({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || undefined,
      orgName: values.orgName.trim(),
      orgSlug: values.orgSlug.trim().toLowerCase(),
      vertical: values.vertical,
      locale: 'en-US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const continueToOrganization = async () => {
    setStepMessage(null)
    const isValid = await form.trigger(['firstName', 'email', 'password'], { shouldFocus: true })
    if (isValid) {
      setStep(2)
    }
  }

  const continueToVertical = async () => {
    setStepMessage(null)
    const isValid = await form.trigger(['orgName', 'orgSlug'], { shouldFocus: true })
    if (isValid) {
      setStep(3)
      return
    }

    setStepMessage('Please complete the organization details.')
  }

  const createOrganization = async () => {
    setStepMessage(null)
    const isValid = await form.trigger(undefined, { shouldFocus: true })
    if (!isValid) {
      setStepMessage('Please complete the highlighted fields.')
      const errors = form.formState.errors
      if (errors.firstName || errors.email || errors.password) {
        setStep(1)
      } else if (errors.orgName || errors.orgSlug) {
        setStep(2)
      }
      return
    }

    submitSignup(form.getValues())
  }

  const goBack = () => {
    setStepMessage(null)
    if (step === 1) {
      navigate('/login')
      return
    }
    setStep((step - 1) as SignupStep)
  }

  const handleSubmit = () => {
    if (step === 1) {
      void continueToOrganization()
      return
    }

    if (step === 2) {
      void continueToVertical()
      return
    }

    void createOrganization()
  }

  return (
    <div className="screen active">
      <div className="split">
        <AuthBrandPanel
          eyebrow={step === 1 ? 'Get Started' : `Step ${step} of 3`}
          headline={getHeadline(step)}
          description={getDescription(step)}
          features={
            <>
              <AuthFeature icon={<CheckIcon />}><strong>Free 14-day trial</strong> - no card required</AuthFeature>
              <AuthFeature icon={<ArrowIcon />}><strong>Backend aligned</strong> - exact auth-service payload</AuthFeature>
              <AuthFeature icon={<BuildingIcon />}><strong>Email verification</strong> - owner activates before login</AuthFeature>
            </>
          }
          stats={step === 1 ? [
            { value: '3', label: 'Simple steps' },
            { value: '14 days', label: 'Free trial' },
            { value: '0', label: 'Card needed' },
          ] : undefined}
        />

        <div className="right-panel">
          <form
            className="form-card"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <button className="back-link" type="button" onClick={goBack}>
              <BackIcon />
              Back{step === 1 ? ' to login' : ''}
            </button>

            <div className="steps">
              <StepItem active={step === 1} done={step > 1} label="Account" number={1} />
              <div className="step-line" />
              <StepItem active={step === 2} done={step > 2} label="Organization" number={2} />
              <div className="step-line" />
              <StepItem active={step === 3} done={false} label="Vertical" number={3} />
            </div>

            {step === 1 && (
              <>
                <div className="form-top" style={{ marginBottom: 20 }}>
                  <div className="form-title">Create your account</div>
                  <div className="form-sub">Already have one? <Link to="/login">Sign in</Link></div>
                </div>
                <div className="social-row"><button className="social-btn" type="button"><GoogleIcon />Sign up with Google</button></div>
                <div className="divider"><div className="divider-line" /><div className="divider-text">or with email</div><div className="divider-line" /></div>
                <div className="field-row">
                  <TextField label="First name" required icon={<UserIcon />} placeholder="Ahmed" error={form.formState.errors.firstName?.message} {...form.register('firstName')} />
                  <TextField label="Last name" icon={<UserIcon />} placeholder="Khan" error={form.formState.errors.lastName?.message} {...form.register('lastName')} />
                </div>
                <TextField label="Work email" required icon={<MailIcon />} type="email" placeholder="ahmed@company.com" error={form.formState.errors.email?.message} {...form.register('email')} />
                <TextField label="Password" required icon={<LockIcon />} type="password" placeholder="S3curePass123" error={form.formState.errors.password?.message} {...form.register('password')} />
                <FormError message={stepMessage ?? undefined} />
                <button className="submit-btn" type="submit">Continue to Organization <ArrowIcon /></button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-top" style={{ marginBottom: 20 }}>
                  <div className="form-title">Set up your organization</div>
                  <div className="form-sub">These fields map directly to backend tenant creation.</div>
                </div>
                <TextField
                  label="Organization name"
                  required
                  icon={<BuildingIcon />}
                  placeholder="Al-Noor Clinic"
                  error={form.formState.errors.orgName?.message}
                  {...form.register('orgName', {
                    onChange: (event) => {
                      if (!form.formState.dirtyFields.orgSlug) {
                        form.setValue('orgSlug', slugify(event.target.value), { shouldDirty: false, shouldValidate: false })
                      }
                    },
                    onBlur: (event) => {
                      if (!form.getValues('orgSlug')) {
                        form.setValue('orgSlug', slugify(event.target.value), { shouldDirty: true, shouldValidate: true })
                      }
                    },
                  })}
                />
                <TextField
                  label="Organization slug"
                  required
                  icon={<BuildingIcon />}
                  placeholder="al-noor-clinic"
                  error={form.formState.errors.orgSlug?.message}
                  {...form.register('orgSlug', {
                    onChange: (event) => {
                      form.setValue('orgSlug', slugify(event.target.value), { shouldDirty: true, shouldValidate: false })
                    },
                    onBlur: (event) => {
                      form.setValue('orgSlug', slugify(event.target.value), { shouldDirty: true, shouldValidate: true })
                    },
                  })}
                />
                <FormError message={stepMessage ?? undefined} />
                <button className="submit-btn" type="submit">Continue to Vertical <ArrowIcon /></button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-top" style={{ marginBottom: 20 }}>
                  <div className="form-title">Choose your vertical</div>
                  <div className="form-sub">BOS uses this to activate the right terminology and workflow defaults.</div>
                </div>
                <div className="vertical-label">Select your primary industry <span style={{ color: 'var(--red)' }}>*</span></div>
                <div className="vertical-grid">
                  {verticalOptions.map((vertical) => (
                    <button
                      className={`v-chip ${selectedVertical === vertical.value ? 'selected' : ''}`}
                      key={vertical.value}
                      type="button"
                      onClick={() => form.setValue('vertical', vertical.value, { shouldDirty: true, shouldValidate: true })}
                    >
                      {vertical.label}
                    </button>
                  ))}
                </div>
                <div className="signup-review">
                  <div><span>Owner</span><strong>{reviewValues.firstName || 'Required'} {reviewValues.lastName ?? ''}</strong></div>
                  <div><span>Email</span><strong>{reviewValues.email || 'Required'}</strong></div>
                  <div><span>Organization</span><strong>{reviewValues.orgName || 'Required'}</strong></div>
                  <div><span>Slug</span><strong>{reviewValues.orgSlug || 'Required'}</strong></div>
                </div>
                <FormError message={stepMessage ?? signup.error?.message} />
                <button className="submit-btn" disabled={signup.isPending} type="submit">
                  {signup.isPending ? 'Creating organization...' : 'Create My Organization'}
                  <ArrowIcon />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

function StepItem({
  active,
  done,
  label,
  number,
}: {
  active: boolean
  done: boolean
  label: string
  number: number
}) {
  return (
    <div className="step">
      <div className={`step-dot ${active ? 'active' : done ? 'done' : ''}`}>
        {done ? <CheckIcon /> : number}
      </div>
      <div className={`step-label ${active ? 'active' : ''}`}>{label}</div>
    </div>
  )
}

function getHeadline(step: SignupStep) {
  if (step === 1) {
    return <>Set up your<br />org in <span>minutes</span></>
  }
  if (step === 2) {
    return <>Tell us about<br />your <span>business</span></>
  }
  return <>Choose your<br /><span>vertical</span></>
}

function getDescription(step: SignupStep): string {
  if (step === 1) {
    return 'Create the owner account with the fields required by the BOS auth service.'
  }
  if (step === 2) {
    return 'Create the tenant name and URL-safe slug before selecting the industry profile.'
  }
  return 'Your selected vertical drives terminology, modules, and provisioning defaults.'
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}
