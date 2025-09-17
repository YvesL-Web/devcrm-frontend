'use client'
import { Section } from '@/components/customs/card'
import { getAuth, setAuth } from '@/lib/auth'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [token, setToken] = useState('')
  const [orgId, setOrgId] = useState('')
  useEffect(() => {
    const s = getAuth()
    setToken(s.accessToken || '')
    setOrgId(s.orgId || '')
  }, [])
  return (
    <div className="space-y-6">
      <h1>Dev Settings</h1>
      <Section title="Local Auth">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
            <label className="text-sm text-slate-600">Access token</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Bearer token"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2">
            <label className="text-sm text-slate-600">Org ID</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="uuid"
            />
          </div>
          <div>
            <button
              className="btn"
              onClick={() => {
                setAuth({ accessToken: token || null, orgId: orgId || null })
                alert('Saved')
              }}
            >
              Save
            </button>
            <button
              className="btn ml-2"
              onClick={() => {
                setAuth({ accessToken: null, orgId: null })
                setToken('')
                setOrgId('')
                alert('Cleared')
              }}
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-slate-500">
            These values are stored in your browser localStorage and used by client-side requests.
          </p>
        </div>
      </Section>
    </div>
  )
}
