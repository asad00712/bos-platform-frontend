import { ArrowRight, Layers3 } from 'lucide-react'

type ModulePlaceholderPageProps = {
  title: string
  description: string
}

export function ModulePlaceholderPage({
  title,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">BOS module</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="secondary-button" type="button">
          <Layers3 size={17} aria-hidden="true" />
          <span>Define workflow</span>
        </button>
      </section>

      <section className="module-blueprint">
        <article className="panel">
          <h2>Frontend contract</h2>
          <p>
            This module will plug into the shared app shell, typed API layer,
            tenant context, vertical terminology, and permission-aware routing.
          </p>
        </article>
        <article className="panel">
          <h2>Next build slice</h2>
          <p>
            Once backend endpoints are confirmed, this page should become the
            first real list/detail workflow with filters, saved views, empty
            states, and audit-friendly actions.
          </p>
          <button className="text-button" type="button">
            Open implementation notes
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </article>
      </section>
    </div>
  )
}
