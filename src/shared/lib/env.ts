/**
 * Typed env. Use this — never read `import.meta.env.*` in components.
 * Update the docs in `docs/rebuild-master-plan.md` §3 if you add an entry.
 */
export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  /** When true, API hooks return mocks instead of hitting the backend. */
  useMocks:
    (import.meta.env.VITE_USE_MOCKS ?? 'true').toString().toLowerCase() ===
    'true',
  /** Simulated latency floor (ms) for the mock layer. */
  mockLatencyMs: Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 250),
}
