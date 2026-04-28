import { useState } from 'react'
import { toast } from 'sonner'
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Layers,
  RotateCcw,
  Settings2,
  Smile,
  Stethoscope,
  Wallet,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'

import { SectionPanel } from '../components/SectionPanel'
import { SurfacePrefsPanel } from '../components/SurfacePrefsPanel'
import { useModulePrefs } from '@/stores/modulePrefs.store'

/**
 * Per-module preferences. Each section reads + writes its own slice of
 * `useModulePrefs` and shows live UX consequences. Hidden behind
 * `Settings → Preferences` and accessible from every module's toolbar
 * kebab via the `settingsItems` slot.
 *
 * Composition: Density (global) at the top, then one panel per module.
 * "Reset everything" lives at the very bottom.
 */
export function PreferencesPage() {
  const prefs = useModulePrefs()
  const [resetting, setResetting] = useState(false)

  function handleResetAll() {
    setResetting(true)
    prefs.resetAll()
    setTimeout(() => setResetting(false), 250)
    toast.success('Preferences reset', {
      description: 'Every module is back to BOS defaults.',
    })
  }

  return (
    <div className="space-y-4">
      <SurfacePrefsPanel />

      <SectionPanel
        title="Display density"
        description="Affects every list, table, and inbox across the app."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice
            active={prefs.density === 'comfortable'}
            label="Comfortable"
            hint="Generous spacing — best for laptops and tablets."
            onSelect={() => prefs.setDensity('comfortable')}
          />
          <Choice
            active={prefs.density === 'compact'}
            label="Compact"
            hint="Tighter rows — best for power users on large monitors."
            onSelect={() => prefs.setDensity('compact')}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="CRM"
        description="Defaults for the contacts list and pipeline."
        icon={<Briefcase className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default list view">
            <Select
              value={prefs.crm.listView}
              onValueChange={(v) =>
                prefs.setCrm({ listView: v as typeof prefs.crm.listView })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default sort">
            <Select
              value={prefs.crm.sortBy}
              onValueChange={(v) => prefs.setCrm({ sortBy: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last updated</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="lifetimeValue">Lifetime value</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Show archived contacts"
            value={prefs.crm.showArchived}
            onChange={(v) => prefs.setCrm({ showArchived: v })}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Scheduling"
        description="Calendar defaults and slot length."
        icon={<CalendarDays className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default view">
            <Select
              value={prefs.scheduling.defaultView}
              onValueChange={(v) =>
                prefs.setScheduling({
                  defaultView: v as typeof prefs.scheduling.defaultView,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Slot length">
            <Select
              value={String(prefs.scheduling.slotMinutes)}
              onValueChange={(v) =>
                prefs.setScheduling({ slotMinutes: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Week starts on">
            <Select
              value={String(prefs.scheduling.weekStartsOn)}
              onValueChange={(v) =>
                prefs.setScheduling({
                  weekStartsOn: Number(v) as 0 | 1 | 6,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Show cancelled appointments"
            value={prefs.scheduling.showCancelled}
            onChange={(v) => prefs.setScheduling({ showCancelled: v })}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Billing"
        description="Tax mode, due-date defaults, reminder cadence."
        icon={<Wallet className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tax mode">
            <Select
              value={prefs.billing.taxMode}
              onValueChange={(v) =>
                prefs.setBilling({ taxMode: v as typeof prefs.billing.taxMode })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exclusive">Tax exclusive (added on)</SelectItem>
                <SelectItem value="inclusive">Tax inclusive (built in)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default due (days)">
            <Select
              value={String(prefs.billing.defaultDueDays)}
              onValueChange={(v) =>
                prefs.setBilling({ defaultDueDays: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Due on receipt</SelectItem>
                <SelectItem value="7">Net 7</SelectItem>
                <SelectItem value="14">Net 14</SelectItem>
                <SelectItem value="30">Net 30</SelectItem>
                <SelectItem value="60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Auto-send overdue reminders"
            value={prefs.billing.autoSendReminders}
            onChange={(v) => prefs.setBilling({ autoSendReminders: v })}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Dashboard"
        description="Default range and which widgets render."
        icon={<Layers className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default date range">
            <Select
              value={prefs.dashboard.dateRange}
              onValueChange={(v) =>
                prefs.setDashboard({
                  dateRange: v as typeof prefs.dashboard.dateRange,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Show revenue chart"
            value={prefs.dashboard.showRevenueChart}
            onChange={(v) => prefs.setDashboard({ showRevenueChart: v })}
          />
          <Toggle
            label="Show sales pipeline"
            value={prefs.dashboard.showPipeline}
            onChange={(v) => prefs.setDashboard({ showPipeline: v })}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="Medical"
        description="Clinical defaults — applied across every chart surface."
        icon={<Stethoscope className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default specialty">
            <Select
              value={prefs.medical.defaultSpecialty}
              onValueChange={(v) =>
                prefs.setMedical({
                  defaultSpecialty: v as typeof prefs.medical.defaultSpecialty,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fm">Family medicine</SelectItem>
                <SelectItem value="im">Internal medicine</SelectItem>
                <SelectItem value="peds">Pediatrics</SelectItem>
                <SelectItem value="ob">OB-GYN</SelectItem>
                <SelectItem value="psych">Psychiatry</SelectItem>
                <SelectItem value="cardio">Cardiology</SelectItem>
                <SelectItem value="derm">Dermatology</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Note autosave (seconds)">
            <Select
              value={String(prefs.medical.autoSaveDraftSeconds)}
              onValueChange={(v) =>
                prefs.setMedical({ autoSaveDraftSeconds: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Every 3 s</SelectItem>
                <SelectItem value="8">Every 8 s</SelectItem>
                <SelectItem value="15">Every 15 s</SelectItem>
                <SelectItem value="30">Every 30 s</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Always confirm before signing"
            value={prefs.medical.confirmBeforeSign}
            onChange={(v) => prefs.setMedical({ confirmBeforeSign: v })}
          />
        </div>
      </SectionPanel>

      <SectionPanel
        title="School"
        description="Default class and inactive-student visibility."
        icon={<GraduationCap className="size-4" />}
      >
        <Toggle
          label="Show inactive students"
          value={prefs.school.showInactiveStudents}
          onChange={(v) => prefs.setSchool({ showInactiveStudents: v })}
        />
      </SectionPanel>

      <SectionPanel
        title="Dental"
        description="Tooth chart numbering and history visibility."
        icon={<Smile className="size-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tooth chart numbering">
            <Select
              value={prefs.dental.chartNumberSystem}
              onValueChange={(v) =>
                prefs.setDental({
                  chartNumberSystem: v as typeof prefs.dental.chartNumberSystem,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fdi">FDI (international)</SelectItem>
                <SelectItem value="universal">Universal (US)</SelectItem>
                <SelectItem value="palmer">Palmer notation</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Toggle
            label="Show historical tooth marks"
            value={prefs.dental.showHistoricalToothMarks}
            onChange={(v) => prefs.setDental({ showHistoricalToothMarks: v })}
          />
        </div>
      </SectionPanel>

      <Separator />

      <Card className="border-destructive/30 bg-destructive/[0.03]">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="size-4 text-destructive" />
              Reset all preferences
            </p>
            <p className="text-xs text-muted-foreground">
              Returns every module to BOS defaults. Tenant-level settings (org / branding /
              billing) are unaffected.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleResetAll}
            disabled={resetting}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset everything
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Choice({
  active,
  label,
  hint,
  onSelect,
}: {
  active: boolean
  label: string
  hint: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border p-4 text-left transition-colors ${
        active
          ? 'border-primary/60 bg-primary/[0.04] ring-1 ring-inset ring-primary/30'
          : 'hover:border-border hover:bg-accent/40'
      }`}
    >
      <p className="text-sm font-medium leading-tight">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-accent/40">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </Label>
  )
}
