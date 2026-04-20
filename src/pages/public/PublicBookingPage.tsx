import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useParams } from 'react-router'

export function PublicBookingPage() {
  const { tenantSlug } = useParams()

  return (
    <main className="booking-page">
      <section className="booking-shell">
        <div className="booking-summary">
          <p className="eyebrow">Public booking</p>
          <h1>Book an appointment with {tenantSlug ?? 'the clinic'}</h1>
          <p>
            This customer-facing flow is intentionally separate from the staff
            shell and ready for tenant branding, service selection, doctor
            selection, and available slots.
          </p>
        </div>
        <div className="booking-steps">
          <button type="button">
            <CalendarDays size={18} aria-hidden="true" />
            Select service
          </button>
          <button type="button">
            <Clock size={18} aria-hidden="true" />
            Choose time
          </button>
          <button type="button">
            <MapPin size={18} aria-hidden="true" />
            Confirm details
          </button>
        </div>
      </section>
    </main>
  )
}
