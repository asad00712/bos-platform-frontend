import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CloudUpload, FileText } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'
import { routes } from '@/routes/routeMap'

import { useCreateDocument } from '../hooks'
import {
  documentKindSchema,
  documentStatusSchema,
} from '../api/documents.contracts'
import { formatFileSize } from '../lib/format'

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  kind: documentKindSchema,
  status: documentStatusSchema,
  tags: z.string(),
  notes: z.string(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  trigger: ReactNode
}

export function UploadDialog({ trigger }: Props) {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const create = useCreateDocument(tenant.id)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      kind: 'general',
      status: 'draft',
      tags: '',
      notes: '',
    },
  })

  const onPickFile = (f: File | null) => {
    setFile(f)
    if (f && !form.getValues('name')) {
      // Strip extension for the default name
      form.setValue('name', f.name.replace(/\.[^.]+$/, ''))
    }
  }

  const handleSubmit = async (values: FormValues) => {
    const created = await create.mutateAsync({
      name: values.name,
      kind: values.kind,
      status: values.status,
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: values.notes || undefined,
      fileName: file?.name,
      size: file?.size,
      mimeType: file?.type || 'application/pdf',
    })
    setOpen(false)
    setFile(null)
    form.reset()
    navigate(routes.app.documents() + `/${created.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Add a contract, consent, template, or general file to your library.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <DropZone file={file} onPick={onPickFile} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New patient consent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kind</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="consent">Consent</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">Pending review</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="comma, separated, tags" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional notes…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DropZone({
  file,
  onPick,
}: {
  file: File | null
  onPick: (f: File | null) => void
}) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm transition hover:bg-muted/60"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files?.[0]
        if (f) onPick(f)
      }}
    >
      <input
        type="file"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div className="space-y-0.5">
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} · {file.type || 'file'}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Click to replace
          </span>
        </>
      ) : (
        <>
          <span className="grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
            <CloudUpload className="size-5" />
          </span>
          <p className="font-medium">Drop a file here, or click to choose</p>
          <p className="text-xs text-muted-foreground">PDF, image, or office file</p>
        </>
      )}
    </label>
  )
}
