import { useParams } from 'react-router'
import { ExternalLink, File } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useDocuments } from '../../hooks'

export function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useDocuments(tenant.id, id)

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Faxes, scans, external records, and consent forms attached to this chart.
        </p>
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (q.data?.items ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents.</p>
      ) : (
        <ul className="space-y-2">
          {(q.data?.items ?? []).map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
              <File className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="break-words font-medium">{d.source}</p>
                <p className="text-xs text-muted-foreground">
                  {d.type.replace('_', ' ')} · {d.pageCount} pp · received {formatRelative(d.receivedAt)}
                </p>
              </div>
              <Badge
                variant={d.status === 'unfiled' ? 'destructive' : 'outline'}
                className="capitalize"
              >
                {d.status}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href={d.url} target="_blank" rel="noreferrer">
                  Open <ExternalLink className="ms-1 size-3" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
