import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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

import { ContactCombobox } from '@/features/scheduling/components/ContactCombobox'
import { useTenant } from '@/shared/hooks/useTenant'

import { useSendMessage } from '../hooks'
import {
  channelSchema,
  type Channel,
  type MessageInput,
} from '../api/communication.contracts'

const formSchema = z.object({
  channel: channelSchema,
  contactId: z.string().nullable(),
  subject: z.string(),
  body: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  trigger: ReactNode
  defaultChannel?: Channel
  defaultContactId?: string | null
  /** Called after a successful send, with the new thread id. */
  onSent?: (threadId: string) => void
}

export function ComposeDialog({
  trigger,
  defaultChannel = 'email',
  defaultContactId = null,
  onSent,
}: Props) {
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)
  const send = useSendMessage(tenant.id)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: defaultChannel,
      contactId: defaultContactId,
      subject: '',
      body: '',
    },
  })

  const channel = form.watch('channel')

  const handleSubmit = async (values: FormValues) => {
    const input: MessageInput = {
      channel: values.channel,
      contactId: values.contactId,
      subject: values.subject || undefined,
      body: values.body,
    }
    const result = await send.mutateAsync(input)
    setOpen(false)
    form.reset({
      channel: defaultChannel,
      contactId: defaultContactId,
      subject: '',
      body: '',
    })
    onSent?.(result.thread.id)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>
            Send an email, SMS, or post an internal note.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="note">Internal note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {channel === 'note' ? 'About contact' : 'To'}
                  </FormLabel>
                  <FormControl>
                    <ContactCombobox
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {channel === 'email' || channel === 'note' ? (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={channel === 'sms' ? 3 : 6}
                      placeholder={
                        channel === 'sms'
                          ? 'Keep it short — SMS limit 160 chars'
                          : channel === 'note'
                            ? 'Visible only to your team'
                            : 'Write your message…'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={send.isPending}>
                {send.isPending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
