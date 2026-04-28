import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useTenant } from '@/shared/hooks/useTenant'

import { useRequestSignature } from '../hooks'
import {
  signatureRequestInputSchema,
  type SignatureRequestInput,
} from '../api/documents.contracts'

type Props = {
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestSignatureDialog({
  documentId,
  open,
  onOpenChange,
}: Props) {
  const { tenant } = useTenant()
  const request = useRequestSignature(tenant.id)
  const form = useForm<SignatureRequestInput>({
    resolver: zodResolver(signatureRequestInputSchema),
    defaultValues: { signerName: '', signerEmail: '' },
  })

  const handleSubmit = async (values: SignatureRequestInput) => {
    await request.mutateAsync({ id: documentId, input: values })
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request signature</DialogTitle>
          <DialogDescription>
            We&apos;ll email a secure signing link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="signerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signer name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="signerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={request.isPending}>
                {request.isPending ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
