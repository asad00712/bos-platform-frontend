export { WorkflowsListPage } from './pages/WorkflowsListPage'
export { WorkflowDetailPage } from './pages/WorkflowDetailPage'
export { RunsPage as AutomationRunsPage } from './pages/RunsPage'
export { AutomationTemplatesPage } from './pages/TemplatesPage'
export { NewWorkflowDialog } from './components/NewWorkflowDialog'

export type {
  Run,
  RunStatus,
  TriggerKind,
  Workflow,
  WorkflowDetail,
  WorkflowInput,
  WorkflowStatus,
} from './api/automation.contracts'
