import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { bootstrapCommands } from '@/shared/command/bootstrapCommands'
import { startDemoNotificationFeed } from '@/stores/notifications.demoFeed'
import App from './App.tsx'

bootstrapCommands()
startDemoNotificationFeed()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
