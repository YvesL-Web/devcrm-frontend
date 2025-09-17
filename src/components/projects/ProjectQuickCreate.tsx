'use client'
import { Input } from '@/components/customs/form'
import { getAuth } from '@/lib/auth'
import { planLimits, type Plan } from '@/lib/planClient'
import { useCreateProject, useMe, useProjects } from '@/lib/queries'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProjectQuickCreate() {
  const [name, setName] = useState('')
  const create = useCreateProject()
  const { data: list } = useProjects({ page: 1, pageSize: 100 })
  const { orgId } = getAuth()
  const me = useMe()
  const plan = me.data?.orgs?.find((o) => o.orgId === orgId)?.plan as Plan | undefined
  const used = list?.total ?? 0
  const max = plan ? planLimits[plan].projectsMax : 0
  const atLimit = plan ? used >= max : false

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await create.mutateAsync({
        name: name.trim(),
        portalPublic: true,
        portalShowChangelog: true,
        portalShowInvoices: true
      })
      setName('')
      toast.success('Project created')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create')
    }
  }

  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">New project</div>
        <div className="text-xs text-slate-500">
          {used} / {max} used
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input placeholder="Project name…" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" disabled={atLimit || create.isPending}>
          {atLimit ? 'Limit reached' : create.isPending ? 'Creating…' : 'Create'}
        </button>
      </form>
      {atLimit ? (
        <div className="text-xs text-slate-500 mt-2">Upgrade to create more projects.</div>
      ) : null}
    </div>
  )
}
