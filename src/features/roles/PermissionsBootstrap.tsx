import { usePermissionsBootstrap } from './hooks'

/**
 * Mounts the current-user permission query and pushes the result into
 * the session store. Render once near the app shell so every component
 * that calls `useHasPermission` reads from a single, hot cache.
 */
export function PermissionsBootstrap() {
  usePermissionsBootstrap()
  return null
}
