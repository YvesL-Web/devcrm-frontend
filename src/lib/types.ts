export type Project = {
  id: string
  orgId: string
  clientId?: string | null
  name: string
  portalSlug: string
  status: 'ACTIVE' | 'ARCHIVED'
  portalPublic: boolean
  portalShowChangelog: boolean
  portalShowInvoices: boolean
  portalWelcome?: string | null
  createdAt: string
  updatedAt?: string
}

export type Task = {
  id: string
  orgId: string
  projectId: string
  title: string
  description?: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigneeId?: string | null
  githubIssueUrl?: string | null
  dueDate?: string | null // YYYY-MM-DD
  labels?: string[] | null
  kanbanOrder?: number
  createdAt: string
  updatedAt: string
}

export type Paginated<T> = { rows: T[]; total: number; page: number; pageSize: number }

export type Release = {
  id: string
  projectId: string
  version?: string | null
  title: string
  bodyMd: string
  createdAt: string
}
export type ChangelogItem = {
  id: string
  releaseId: string
  type: 'FEATURE' | 'FIX' | 'CHORE'
  title: string
  url?: string | null
}

export type Client = {
  id: string
  orgId: string
  name: string
  email?: string | null
  company?: string | null
  phone?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectRow = {
  id: string
  orgId: string
  name: string
  portalSlug: string
  status: 'ACTIVE' | 'ARCHIVED'
  portalPublic: boolean
  portalShowChangelog: boolean
  portalShowInvoices: boolean
  portalWelcome?: string | null
  createdAt: string
  clientId?: string | null // 👈 add
}

// ----- Invoices -----

export type InvoiceItemDto = {
  id: string
  description: string
  quantity: string
  unitPrice: string
  amount: string
  sortOrder: number
}

export type InvoiceDto = {
  id: string
  orgId: string
  projectId: string | null
  clientId: string | null
  number: string
  currency: string
  issueDate: string
  dueDate: string | null
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELED'
  subtotal: string
  tax: string
  total: string
  notes: string | null
  terms: string | null
  createdAt: string
  updatedAt: string
  // présent uniquement sur GET /invoices/:id :
  items?: InvoiceItemDto[]
}

type InvoiceItemInput = {
  description: string
  quantity: number
  unitPrice: number
  sortOrder?: number
}

export type InvoiceUpsert = {
  number: string
  currency: string
  issueDate: string // YYYY-MM-DD
  dueDate?: string | null
  status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELED'
  clientId?: string | null
  projectId?: string | null
  notes?: string | null
  terms?: string | null
  items: InvoiceItemInput[]
  taxRatePct?: number
}
