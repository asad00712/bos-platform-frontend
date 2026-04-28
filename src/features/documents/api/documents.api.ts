import { apiRequest } from '@/api/http'
import { env } from '@/shared/lib/env'

import {
  documentDetailSchema,
  documentsListResponseSchema,
  type DocumentDetail,
  type DocumentInput,
  type DocumentListFilters,
  type DocumentsListResponse,
  type SignatureRequestInput,
} from './documents.contracts'
import { documentsMocks } from './documents.mocks'

async function delay() {
  await new Promise((r) => setTimeout(r, env.mockLatencyMs))
}

export const documentsApi = {
  async list(filters: DocumentListFilters): Promise<DocumentsListResponse> {
    if (env.useMocks) {
      await delay()
      return documentsListResponseSchema.parse(documentsMocks.list(filters))
    }
    const qs = new URLSearchParams()
    if (filters.search) qs.set('search', filters.search)
    if (filters.kind) qs.set('kind', filters.kind)
    if (filters.status) qs.set('status', filters.status)
    if (filters.tag) qs.set('tag', filters.tag)
    const data = await apiRequest<unknown>(`/documents?${qs.toString()}`)
    return documentsListResponseSchema.parse(data)
  },

  async get(id: string): Promise<DocumentDetail> {
    if (env.useMocks) {
      await delay()
      const result = documentsMocks.get(id)
      if (!result) throw new Error('Document not found')
      return documentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/documents/${id}`)
    return documentDetailSchema.parse(data)
  },

  async create(input: DocumentInput): Promise<DocumentDetail> {
    if (env.useMocks) {
      await delay()
      return documentDetailSchema.parse(documentsMocks.create(input))
    }
    const data = await apiRequest<unknown>('/documents', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return documentDetailSchema.parse(data)
  },

  async update(id: string, patch: Partial<DocumentInput>): Promise<DocumentDetail> {
    if (env.useMocks) {
      await delay()
      const result = documentsMocks.update(id, patch)
      if (!result) throw new Error('Document not found')
      return documentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    return documentDetailSchema.parse(data)
  },

  async remove(id: string): Promise<void> {
    if (env.useMocks) {
      await delay()
      const ok = documentsMocks.remove(id)
      if (!ok) throw new Error('Document not found')
      return
    }
    await apiRequest<void>(`/documents/${id}`, { method: 'DELETE' })
  },

  async addVersion(id: string, notes: string | null): Promise<DocumentDetail> {
    if (env.useMocks) {
      await delay()
      const result = documentsMocks.addVersion(id, notes)
      if (!result) throw new Error('Document not found')
      return documentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/documents/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    })
    return documentDetailSchema.parse(data)
  },

  async requestSignature(
    id: string,
    input: SignatureRequestInput,
  ): Promise<DocumentDetail> {
    if (env.useMocks) {
      await delay()
      const result = documentsMocks.requestSignature(id, input)
      if (!result) throw new Error('Document not found')
      return documentDetailSchema.parse(result)
    }
    const data = await apiRequest<unknown>(`/documents/${id}/signatures`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return documentDetailSchema.parse(data)
  },
}
