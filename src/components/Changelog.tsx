import { Section } from '@/components/customs/card'
import { Badge } from './ui/badge'

export type Item = { id: string; type: 'FEATURE' | 'FIX' | 'CHORE'; title: string; url?: string }
export type Release = {
  id: string
  version?: string | null
  title: string
  bodyMd: string
  createdAt: string
}
export type ReleaseBlock = { release: Release; items: Item[] }
export default function Changelog({ blocks }: { blocks: ReleaseBlock[] }) {
  return (
    <Section title="Changelog">
      {blocks.length === 0 ? (
        <div className="muted">No releases yet.</div>
      ) : (
        <div className="space-y-4">
          {blocks.map((b) => (
            <div key={b.release.id} className="space-y-2">
              <h3 className="text-lg">
                {b.release.version ? `${b.release.version} — ` : ''}
                {b.release.title}
              </h3>
              <div className="muted text-xs">
                {new Date(b.release.createdAt).toLocaleDateString()}
              </div>
              {b.release.bodyMd ? (
                <div className="whitespace-pre-wrap text-sm">{b.release.bodyMd}</div>
              ) : null}
              {b.items.length ? (
                <ul className="list-disc pl-5 text-sm">
                  {b.items.map((i) => (
                    <li key={i.id}>
                      <Badge variant={i.type.toLowerCase() as any}>
                        {i.type[0] + i.type.slice(1).toLowerCase()}
                      </Badge>{' '}
                      {i.url ? (
                        <a
                          className="text-sky-700 hover:underline"
                          href={i.url}
                          target="_blank"
                          rel="noopener"
                        >
                          {i.title}
                        </a>
                      ) : (
                        i.title
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
