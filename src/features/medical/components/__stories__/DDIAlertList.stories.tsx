import type { Meta, StoryObj } from '@storybook/react-vite'
import { DDIAlertList } from '../DDIAlertList'

const meta = {
  title: 'Medical/DDIAlertList',
  component: DDIAlertList,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ width: 720 }}>{Story()}</div>],
} satisfies Meta<typeof DDIAlertList>

export default meta
type Story = StoryObj<typeof meta>

export const AllTiers: Story = {
  args: {
    alerts: [
      {
        id: '1',
        tier: 'contraindicated',
        primary: 'Amoxicillin',
        counter: 'Penicillin allergy',
        description: 'Penicillin allergy on file with anaphylaxis.',
        recommendation: 'Choose azithromycin or cefdinir if cross-reactivity assessed safe.',
        allergyHardStop: true,
      },
      {
        id: '2',
        tier: 'severe',
        primary: 'Warfarin',
        counter: 'Amiodarone',
        description: 'Amiodarone potentiates warfarin.',
        recommendation: 'Reduce warfarin 30–50% and recheck INR in 3–5 days.',
      },
      {
        id: '3',
        tier: 'moderate',
        primary: 'Atorvastatin',
        counter: 'Clarithromycin',
        description: 'CYP3A4 inhibition increases statin exposure.',
        recommendation: 'Hold statin during macrolide course.',
      },
      {
        id: '4',
        tier: 'minor',
        primary: 'Metformin',
        counter: 'IV contrast',
        description: 'Hold metformin around contrast administration if eGFR <60.',
        recommendation: 'Hold day of and 48h post; recheck creatinine before resuming.',
      },
    ],
  },
}

export const HardStopOnly: Story = {
  args: {
    alerts: [
      {
        id: '1',
        tier: 'contraindicated',
        primary: 'Lisinopril',
        counter: 'Pregnancy',
        description: 'ACE inhibitor — fetal renal injury and oligohydramnios risk.',
        recommendation: 'Switch to labetalol or methyldopa for HTN in pregnancy.',
      },
    ],
  },
}

export const Empty: Story = { args: { alerts: [] } }
