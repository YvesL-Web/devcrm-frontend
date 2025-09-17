'use client'

import { apiFetchBlob } from '@/lib/requestBlob'
import { ChangelogItem, Client, InvoiceDto, InvoiceUpsert, Release, Task } from '@/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'

// -------- Projects
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
  clientId?: string | null
}

export function useProjects(params?: {
  page?: number
  pageSize?: number
  q?: string
  status?: 'ACTIVE' | 'ARCHIVED'
}) {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.pageSize) q.set('pageSize', String(params.pageSize))
  if (params?.q) q.set('q', params.q)
  if (params?.status) q.set('status', params.status)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () =>
      apiFetch<{ rows: ProjectRow[]; total: number; page: number; pageSize: number }>(
        `/projects${qs}`
      )
  })
}

export function useProject(id?: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiFetch<ProjectRow>(`/projects/${id}`),
    enabled: !!id
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      name: string
      portalPublic?: boolean
      portalShowChangelog?: boolean
      portalShowInvoices?: boolean
      portalWelcome?: string | null
    }) => apiFetch<ProjectRow>('/projects', { method: 'POST', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ProjectRow> & { clientId?: string | null }) =>
      apiFetch<ProjectRow>(`/projects/${id}`, { method: 'PATCH', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useDeleteProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

// -------- Tasks
export function useTasks(params: {
  projectId?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  q?: string
  page?: number
  pageSize?: number
  sort?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'kanbanOrder'
  order?: 'ASC' | 'DESC'
}) {
  const qs = new URLSearchParams()
  if (params.projectId) qs.set('projectId', params.projectId)
  if (params.status) qs.set('status', params.status)
  if (params.q) qs.set('q', params.q)
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.sort) qs.set('sort', params.sort)
  if (params.order) qs.set('order', params.order)
  return useQuery({
    queryKey: ['tasks', Object.fromEntries(qs)],
    queryFn: () =>
      apiFetch<{ rows: Task[]; total: number; page: number; pageSize: number }>(
        `/tasks?${qs.toString()}`
      )
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task> & { projectId: string; title: string }) =>
      apiFetch<Task>('/tasks', { method: 'POST', json: payload }),
    onSuccess: (_t) => {
      // qc.invalidateQueries({ queryKey: ['tasks', { projectId: t.projectId }] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

export function useUpdateTask(id: string, projectId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Task>) =>
      apiFetch<Task>(`/tasks/${id}`, { method: 'PATCH', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      if (projectId) qc.invalidateQueries({ queryKey: ['tasks', { projectId }] })
    }
  })
}

export function useDeleteTask(id: string, projectId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      if (projectId) qc.invalidateQueries({ queryKey: ['tasks', { projectId }] })
    }
  })
}

export function useTaskComments(taskId?: string) {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () =>
      apiFetch<{ rows: { id: string; authorId: string; body: string; createdAt: string }[] }>(
        `/tasks/${taskId}/comments`
      ),
    enabled: !!taskId
  })
}

export function useAddComment(taskId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: string }) =>
      apiFetch(`/tasks/${taskId}/comments`, { method: 'POST', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-comments', taskId] })
    }
  })
}

// Releases
export function useReleases(projectId?: string) {
  const qs = projectId ? `?projectId=${projectId}&page=1&pageSize=50` : ''
  return useQuery({
    queryKey: ['releases', projectId],
    queryFn: () =>
      apiFetch<{
        rows: (Release & { items: ChangelogItem[] })[]
        total: number
        page: number
        pageSize: number
      }>(`/releases${qs}`),
    enabled: !!projectId
  })
}

export function useCreateRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; version?: string; title: string; bodyMd: string }) =>
      apiFetch<Release>('/releases', { method: 'POST', json: payload }),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ['releases', vars.projectId] })
    }
  })
}

export function useDeleteRelease(id: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>(`/releases/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['releases', projectId] })
    }
  })
}

export function useAddChangeItem(releaseId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { type: 'FEATURE' | 'FIX' | 'CHORE'; title: string; url?: string }) =>
      apiFetch(`/releases/${releaseId}/items`, { method: 'POST', json: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['releases', projectId] })
  })
}

export function useDeleteChangeItem(itemId: string, projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<void>(`/releases/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['releases', projectId] })
  })
}

// Kanban: liste triée par kanbanOrder ASC
export function useTasksForKanban(projectId: string) {
  return useTasks({ projectId, page: 1, pageSize: 100, sort: 'kanbanOrder', order: 'ASC' })
}

export function useReorderKanban() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      projectId: string
      columns: { OPEN: string[]; IN_PROGRESS: string[]; DONE: string[] }
    }) => apiFetch('/tasks/kanban/reorder', { method: 'PATCH', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

// Types minimaliste du auth/me
export type MeOrg = {
  orgId: string
  orgName: string
  role: 'OWNER' | 'MEMBER' | 'CLIENT_VIEWER'
  plan: 'FREE' | 'PRO' | 'TEAM'
  planStatus: string | null
}

export type MeResponse = {
  user: { id: string }
  orgs: MeOrg[]
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeResponse>('/auth/me')
  })
}

export function useOrgMembers(orgId?: string) {
  return useQuery({
    queryKey: ['org-members', orgId || 'none'],
    queryFn: () =>
      apiFetch<{
        rows: {
          userId: string
          orgId: string
          role: string
          name?: string | null
          email?: string | null
        }[]
      }>('/orgs/members'),
    enabled: !!orgId
  })
}

// ---- Clients ----
export function useClients(params?: { page?: number; pageSize?: number; q?: string }) {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.pageSize) q.set('pageSize', String(params.pageSize))
  if (params?.q) q.set('q', params.q)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () =>
      apiFetch<{ rows: Client[]; total: number; page: number; pageSize: number }>(`/clients${qs}`)
  })
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => apiFetch<Client>(`/clients/${id}`),
    enabled: !!id // ne pas fetch si pas d’id
  })
}

// recherche live (auto-complete)
export function useSearchClients(q: string) {
  const qs = q.trim()
  return useQuery({
    queryKey: ['clients-search', qs],
    queryFn: () =>
      apiFetch<{ rows: Client[]; total: number }>(
        `/clients?q=${encodeURIComponent(qs)}&page=1&pageSize=10`
      ),
    enabled: qs.length >= 2
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Client>) =>
      apiFetch<Client>('/clients', { method: 'POST', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Client>) =>
      apiFetch<Client>(`/clients/${id}`, { method: 'PATCH', json: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', id] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

export function useDeleteClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch(`/clients/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

// Assign client to project
export function useAssignProjectClient(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (clientId: string | null) =>
      apiFetch(`/projects/${projectId}`, { method: 'PATCH', json: { clientId } }),
    onSuccess: (_data, clientId) => {
      // // ✅ met à jour immédiatement le cache du projet (optimistic UI)
      // qc.setQueryData(['project', projectId], (prev:) => (prev ? { ...prev, clientId } : prev))
      // // ✅ et assure un refetch propre
      qc.invalidateQueries({ queryKey: ['project', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] }) // si tu as une liste quelque part
    }
  })
}

// ---- Invoices ----
export function useInvoices(params?: {
  page?: number
  pageSize?: number
  status?: InvoiceDto['status']
  clientId?: string
  projectId?: string
  q?: string
}) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params?.status) qs.set('status', params.status)
  if (params?.clientId) qs.set('clientId', params.clientId)
  if (params?.projectId) qs.set('projectId', params.projectId)
  if (params?.q) qs.set('q', params.q)
  return useQuery({
    queryKey: ['invoices', Object.fromEntries(qs)],
    queryFn: () =>
      apiFetch<{ rows: InvoiceDto[]; total: number; page: number; pageSize: number }>(
        `/invoices?${qs}`
      )
  })
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ['invoice', id || 'none'],
    queryFn: () => apiFetch<InvoiceDto>(`/invoices/${id}`),
    enabled: !!id
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: InvoiceUpsert) =>
      apiFetch<InvoiceDto>('/invoices', { method: 'POST', json: body }),
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.setQueryData(['invoice', inv.id], inv)
    }
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<InvoiceUpsert>) =>
      apiFetch<InvoiceDto>(`/invoices/${id}`, { method: 'PATCH', json: body }),
    onSuccess: (inv) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.setQueryData(['invoice', inv.id], inv)
    }
  })
}

export function useDeleteInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch(`/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.removeQueries({ queryKey: ['invoice', id] })
    }
  })
}

// download PDF (FREE/PRO)
export async function downloadInvoicePdf(id: string) {
  const blob = await apiFetchBlob(`/invoices/${id}/pdf`)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${id}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export function useSendInvoiceEmail(id: string) {
  return useMutation({
    mutationFn: (body: { to?: string; subject?: string; message?: string }) =>
      apiFetch(`/invoices/${id}/send`, { method: 'POST', json: body })
  })
}
