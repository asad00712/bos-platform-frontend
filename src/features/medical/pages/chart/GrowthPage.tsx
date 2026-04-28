import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { TrendingUp } from 'lucide-react'

import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useTenant } from '@/shared/hooks/useTenant'

import { GrowthChart, type GrowthChartKind, type GrowthSource } from '../../components/GrowthChart'
import { usePatient, useVitals } from '../../hooks'

export function GrowthPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const patient = usePatient(tenant.id, id)
  const vitals = useVitals(tenant.id, id)
  const [tab, setTab] = useState<GrowthChartKind>('weight')

  const isPeds = (patient.data?.age ?? 99) < 18
  const ageMonths = useMemo(() => {
    if (!patient.data) return 0
    const dob = new Date(patient.data.patient.dateOfBirth)
    const ms = Date.now() - dob.getTime()
    return ms / (30.4375 * 86_400_000)
  }, [patient.data])

  const [source, setSource] = useState<GrowthSource>(ageMonths < 24 ? 'who_0_24mo' : 'cdc_2_20yr')

  const sex = patient.data?.patient.sexAtBirth === 'female' ? 'female' : 'male'

  const points = useMemo(() => {
    if (!patient.data || !vitals.data) return []
    const dob = new Date(patient.data.patient.dateOfBirth).getTime()
    const code =
      tab === 'weight'
        ? '29463-7'
        : tab === 'height'
          ? '8302-2'
          : '9843-4'
    return (vitals.data.flowsheet ?? [])
      .filter((o) => o.code.code === code && o.value)
      .map((o) => {
        const ageMs = new Date(o.effectiveDateTime).getTime() - dob
        const ageMonthsHere = ageMs / (30.4375 * 86_400_000)
        const x = source === 'who_0_24mo' ? ageMonthsHere : ageMonthsHere / 12
        return { x, y: o.value!.value }
      })
      .sort((a, b) => a.x - b.x)
  }, [patient.data, vitals.data, tab, source])

  if (patient.isLoading || !patient.data) {
    return <Skeleton className="h-72 w-full" />
  }

  if (!isPeds) {
    return (
      <div className="rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <TrendingUp className="mx-auto mb-2 size-6 opacity-50" />
        Growth charts apply to pediatric patients (under 18). This patient is{' '}
        {patient.data.age} years old.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Growth</h2>
          <p className="text-sm text-muted-foreground">
            Plotted against {ageMonths < 24 ? 'WHO 0–24 mo' : 'CDC 2–20 yr'} reference percentiles.
          </p>
        </div>
        <Select value={source} onValueChange={(v) => setSource(v as GrowthSource)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="who_0_24mo">WHO 0–24 months</SelectItem>
            <SelectItem value="cdc_2_20yr">CDC 2–20 years</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as GrowthChartKind)}>
        <TabsList>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="height">Height</TabsTrigger>
          {source === 'who_0_24mo' ? (
            <TabsTrigger value="head_circumference">Head circumference</TabsTrigger>
          ) : null}
        </TabsList>
        <TabsContent value="weight" className="mt-4">
          <GrowthChart source={source} kind="weight" sex={sex} points={points} />
        </TabsContent>
        <TabsContent value="height" className="mt-4">
          <GrowthChart source={source} kind="height" sex={sex} points={points} />
        </TabsContent>
        <TabsContent value="head_circumference" className="mt-4">
          <GrowthChart source={source} kind="head_circumference" sex={sex} points={points} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
