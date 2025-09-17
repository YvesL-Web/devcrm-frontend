import { publicFetch } from '@/lib/public-api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// types du payload renvoyé par GET /portal/:slug
type PortalReleaseItem = {
  id: string
  releaseId: string
  type: 'FEATURE' | 'FIX' | 'CHORE'
  title: string
  url?: string | null
}
type PortalRelease = {
  id: string
  projectId: string
  version?: string | null
  title: string
  bodyMd: string
  createdAt: string
  items: PortalReleaseItem[]
}
type PortalPayload = {
  project: {
    name: string
    portalWelcome?: string | null
    portalShowChangelog: boolean
    portalShowInvoices: boolean
  }
  releases?: PortalRelease[]
}

export const revalidate = 60 // 60s

async function getPortal(slug: string) {
  return publicFetch<PortalPayload>(`/portal/${encodeURIComponent(slug)}`)
}

export default async function PublicPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  let data: PortalPayload | null = null
  let error: string | null = null
  try {
    data = await getPortal((await params).slug)
  } catch (e: any) {
    error = e?.message || 'Unable to load portal'
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-2">Project Portal</h1>
        <div className="text-sm" style={{ color: '#b91c1c' }}>
          {error}
        </div>
      </div>
    )
  }
  if (!data) return null

  const p = data.project

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        {p.portalWelcome ? (
          <div className="prose prose-slate">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.portalWelcome}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Welcome to the project portal.</p>
        )}
      </header>

      {p.portalShowChangelog ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Changelog</h2>
          {!data.releases?.length ? (
            <div className="text-sm text-slate-500">No releases yet.</div>
          ) : (
            <ul className="space-y-4">
              {data.releases!.map((r) => (
                <li key={r.id} className="border rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {r.title}{' '}
                        {r.version ? (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: '#f1f5f9' }}
                          >
                            {r.version}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {r.bodyMd ? (
                    <div className="prose prose-slate mt-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.bodyMd}</ReactMarkdown>
                    </div>
                  ) : null}

                  {r.items?.length ? (
                    <div className="mt-3">
                      <div className="font-medium mb-1 text-sm">Changes</div>
                      <ul className="space-y-1">
                        {r.items.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between border rounded-lg px-2 py-1"
                          >
                            <div className="text-sm">
                              <span
                                className="text-xs mr-2 px-1.5 py-0.5 rounded"
                                style={{ background: '#eef2ff' }}
                              >
                                {it.type}
                              </span>
                              {it.title}
                              {it.url ? (
                                <>
                                  {' '}
                                  —{' '}
                                  <a
                                    className="text-sky-700 hover:underline"
                                    href={it.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    link
                                  </a>
                                </>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!p.portalShowChangelog && !p.portalShowInvoices ? (
        <div className="text-sm text-slate-500">
          This portal has no public sections enabled yet.
        </div>
      ) : null}

      {/* Placeholder pour invoices publiques plus tard */}
      {p.portalShowInvoices ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <div className="text-sm text-slate-500">Public invoices are not enabled yet.</div>
        </section>
      ) : null}
    </div>
  )
}
