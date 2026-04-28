import type {
  Document,
  DocumentDetail,
  DocumentInput,
  DocumentListFilters,
  DocumentVersion,
  DocumentsListResponse,
  SignatureRequest,
  SignatureRequestInput,
} from './documents.contracts'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

type StoredDocument = {
  doc: Document
  notes: string | null
  versions: DocumentVersion[]
  signatures: SignatureRequest[]
}

function mkDoc(input: {
  id: string
  name: string
  kind: Document['kind']
  status: Document['status']
  ownerName?: string | null
  contactId?: string | null
  contactName?: string | null
  tags?: string[]
  mimeType: string
  size: number
  versions: number
  signatures?: SignatureRequest[]
  pendingSignatures?: number
  createdDaysAgo: number
  updatedDaysAgo: number
  notes?: string | null
}): StoredDocument {
  const versions: DocumentVersion[] = Array.from({ length: input.versions }).map(
    (_, i) => ({
      id: `${input.id}-v${i + 1}`,
      versionNumber: i + 1,
      createdAt: daysAgo(input.createdDaysAgo - i * 2),
      createdByName: input.ownerName ?? 'Maya',
      notes: i === 0 ? 'Initial upload.' : `Revision ${i + 1}`,
      fileUrl: null,
      size: input.size + i * 1024,
      mimeType: input.mimeType,
    }),
  )
  const signatures = input.signatures ?? []
  return {
    doc: {
      id: input.id,
      name: input.name,
      kind: input.kind,
      status: input.status,
      ownerName: input.ownerName ?? 'Maya',
      contactId: input.contactId ?? null,
      contactName: input.contactName ?? null,
      tags: input.tags ?? [],
      mimeType: input.mimeType,
      size: input.size,
      versionCount: versions.length,
      signatureCount: signatures.length,
      pendingSignatures:
        input.pendingSignatures ??
        signatures.filter((s) => s.status === 'pending' || s.status === 'sent').length,
      createdAt: daysAgo(input.createdDaysAgo),
      updatedAt: daysAgo(input.updatedDaysAgo),
    },
    notes: input.notes ?? null,
    versions,
    signatures,
  }
}

let store: StoredDocument[] = [
  mkDoc({
    id: 'doc-001',
    name: 'New Patient Consent — Sarah Mitchell',
    kind: 'consent',
    status: 'active',
    contactId: 'c-1001',
    contactName: 'Sarah Mitchell',
    tags: ['consent', 'dental'],
    mimeType: 'application/pdf',
    size: 192_000,
    versions: 1,
    signatures: [
      {
        id: 'sig-001',
        signerName: 'Sarah Mitchell',
        signerEmail: 'sarah.m@example.com',
        status: 'signed',
        sentAt: daysAgo(7),
        signedAt: daysAgo(6),
      },
    ],
    createdDaysAgo: 8,
    updatedDaysAgo: 6,
    notes: 'Standard new-patient HIPAA consent. Counter-signed.',
  }),
  mkDoc({
    id: 'doc-002',
    name: 'Treatment Plan Estimate — Greenfield Academy',
    kind: 'contract',
    status: 'pending_review',
    contactId: 'c-1003',
    contactName: 'Greenfield Academy',
    tags: ['enterprise', 'school'],
    mimeType: 'application/pdf',
    size: 412_000,
    versions: 3,
    signatures: [
      {
        id: 'sig-010',
        signerName: 'Director — Greenfield',
        signerEmail: 'admin@greenfieldschool.edu',
        status: 'sent',
        sentAt: daysAgo(2),
        signedAt: null,
      },
      {
        id: 'sig-011',
        signerName: 'Owner',
        signerEmail: 'owner@acmedental.com',
        status: 'pending',
        sentAt: null,
        signedAt: null,
      },
    ],
    createdDaysAgo: 14,
    updatedDaysAgo: 1,
    notes: 'Annual screening contract. Awaiting district counter-sign.',
  }),
  mkDoc({
    id: 'doc-003',
    name: 'Standard HIPAA Consent Template',
    kind: 'template',
    status: 'active',
    tags: ['template', 'consent'],
    mimeType: 'application/pdf',
    size: 88_000,
    versions: 2,
    createdDaysAgo: 200,
    updatedDaysAgo: 60,
    notes: 'Used for every new patient.',
  }),
  mkDoc({
    id: 'doc-004',
    name: 'Lab Order — Dr. Ahmed (Khalid)',
    kind: 'medical',
    status: 'active',
    contactId: 'c-1002',
    contactName: 'Khalid Al-Rashid',
    tags: ['lab', 'rx'],
    mimeType: 'application/pdf',
    size: 64_000,
    versions: 1,
    createdDaysAgo: 3,
    updatedDaysAgo: 3,
  }),
  mkDoc({
    id: 'doc-005',
    name: 'Whitening Aftercare Sheet',
    kind: 'general',
    status: 'active',
    tags: ['handout'],
    mimeType: 'application/pdf',
    size: 52_000,
    versions: 1,
    createdDaysAgo: 95,
    updatedDaysAgo: 95,
  }),
  mkDoc({
    id: 'doc-006',
    name: 'Annual Service Agreement Template',
    kind: 'template',
    status: 'active',
    tags: ['template', 'contract'],
    mimeType: 'application/pdf',
    size: 162_000,
    versions: 1,
    createdDaysAgo: 320,
    updatedDaysAgo: 320,
  }),
  mkDoc({
    id: 'doc-007',
    name: 'X-ray Imaging Consent (draft)',
    kind: 'consent',
    status: 'draft',
    tags: ['draft'],
    mimeType: 'application/pdf',
    size: 24_000,
    versions: 1,
    createdDaysAgo: 1,
    updatedDaysAgo: 1,
  }),
]

function applyFilters(items: Document[], f: DocumentListFilters): Document[] {
  const q = f.search?.trim().toLowerCase()
  return items.filter((d) => {
    if (f.kind && d.kind !== f.kind) return false
    if (f.status && d.status !== f.status) return false
    if (f.tag && !d.tags.includes(f.tag)) return false
    if (q) {
      const hay = `${d.name} ${(d.tags ?? []).join(' ')} ${d.contactName ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export const documentsMocks = {
  list(filters: DocumentListFilters): DocumentsListResponse {
    const all = store.map((s) => s.doc)
    const items = applyFilters(all, filters).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    )
    return { items, total: items.length }
  },

  get(id: string): DocumentDetail | null {
    const found = store.find((s) => s.doc.id === id)
    if (!found) return null
    return {
      ...found.doc,
      notes: found.notes,
      versions: [...found.versions].sort(
        (a, b) => b.versionNumber - a.versionNumber,
      ),
      signatures: found.signatures,
    }
  },

  create(input: DocumentInput): DocumentDetail {
    const id = `doc-${Date.now()}`
    const mime = input.mimeType ?? 'application/pdf'
    const size = input.size ?? 64_000
    const v: DocumentVersion = {
      id: `${id}-v1`,
      versionNumber: 1,
      createdAt: new Date().toISOString(),
      createdByName: 'You',
      notes: 'Initial upload.',
      fileUrl: null,
      size,
      mimeType: mime,
    }
    const created: StoredDocument = {
      doc: {
        id,
        name: input.name,
        kind: input.kind,
        status: input.status,
        ownerName: 'You',
        contactId: input.contactId ?? null,
        contactName: null,
        tags: input.tags,
        mimeType: mime,
        size,
        versionCount: 1,
        signatureCount: 0,
        pendingSignatures: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      notes: input.notes ?? null,
      versions: [v],
      signatures: [],
    }
    store = [created, ...store]
    return documentsMocks.get(id)!
  },

  update(id: string, patch: Partial<DocumentInput>): DocumentDetail | null {
    const idx = store.findIndex((s) => s.doc.id === id)
    if (idx < 0) return null
    const cur = store[idx]
    const nextDoc: Document = {
      ...cur.doc,
      name: patch.name ?? cur.doc.name,
      kind: patch.kind ?? cur.doc.kind,
      status: patch.status ?? cur.doc.status,
      contactId: patch.contactId !== undefined ? patch.contactId ?? null : cur.doc.contactId,
      tags: patch.tags ?? cur.doc.tags,
      updatedAt: new Date().toISOString(),
    }
    store[idx] = {
      ...cur,
      doc: nextDoc,
      notes: patch.notes !== undefined ? patch.notes ?? null : cur.notes,
    }
    return documentsMocks.get(id)
  },

  remove(id: string): boolean {
    const before = store.length
    store = store.filter((s) => s.doc.id !== id)
    return store.length < before
  },

  addVersion(id: string, notes: string | null): DocumentDetail | null {
    const idx = store.findIndex((s) => s.doc.id === id)
    if (idx < 0) return null
    const cur = store[idx]
    const next = cur.versions.length + 1
    const v: DocumentVersion = {
      id: `${id}-v${next}`,
      versionNumber: next,
      createdAt: new Date().toISOString(),
      createdByName: 'You',
      notes: notes ?? `Revision ${next}`,
      fileUrl: null,
      size: cur.doc.size,
      mimeType: cur.doc.mimeType,
    }
    const updated = {
      ...cur,
      versions: [...cur.versions, v],
      doc: {
        ...cur.doc,
        versionCount: cur.versions.length + 1,
        updatedAt: new Date().toISOString(),
      },
    }
    store[idx] = updated
    return documentsMocks.get(id)
  },

  requestSignature(
    id: string,
    input: SignatureRequestInput,
  ): DocumentDetail | null {
    const idx = store.findIndex((s) => s.doc.id === id)
    if (idx < 0) return null
    const cur = store[idx]
    const sig: SignatureRequest = {
      id: `sig-${Date.now()}`,
      signerName: input.signerName,
      signerEmail: input.signerEmail,
      status: 'sent',
      sentAt: new Date().toISOString(),
      signedAt: null,
    }
    const signatures = [...cur.signatures, sig]
    store[idx] = {
      ...cur,
      signatures,
      doc: {
        ...cur.doc,
        signatureCount: signatures.length,
        pendingSignatures: signatures.filter(
          (s) => s.status === 'pending' || s.status === 'sent',
        ).length,
        updatedAt: new Date().toISOString(),
      },
    }
    return documentsMocks.get(id)
  },
}
