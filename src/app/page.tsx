import Link from 'next/link'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* NAVBAR */}
      <nav className="h-16 border-b bg-white/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900" />
            <span className="font-semibold">DevCRM</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#pricing" className="hover:underline">
              Pricing
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link className="px-3 py-2 text-sm rounded-lg border hover:bg-slate-50" href="/login">
              Log in
            </Link>
            <Link
              className="px-3 py-2 text-sm rounded-lg border bg-slate-900 text-white hover:opacity-90"
              href="/register"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Ship faster with a developer-first CRM
            </h1>
            <p className="mt-4 text-slate-600">
              Lightweight Jira-like projects, Kanban, clients & invoices — built for freelancers and
              small teams.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                className="px-4 py-2 rounded-lg border bg-slate-900 text-white hover:opacity-90"
                href="/register"
              >
                Create free account
              </Link>
              <Link className="px-4 py-2 rounded-lg border hover:bg-slate-50" href="/login">
                I already have an account
              </Link>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Free plan available • No credit card required
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-xl border shadow-sm overflow-hidden">
              <div className="bg-slate-100 h-8 flex items-center gap-1 px-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-4">
                <div className="h-52 bg-slate-100 rounded-lg" />
                <div className="mt-3 h-24 bg-slate-100 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">What you get</h2>
        <div
          className="grid mt-6"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}
        >
          {[
            {
              title: 'Projects & Kanban',
              text: 'Clean, fast boards with inline editing and labels.'
            },
            {
              title: 'Client management',
              text: 'Link projects to clients, keep contact details in one place.'
            },
            {
              title: 'Public portal',
              text: 'Share release notes and invoices privately or publicly.'
            },
            { title: 'Invoices (PDF)', text: 'Generate invoices; email sending on PRO.' },
            { title: 'GitHub import', text: 'Import PRs to changelogs (PRO).' },
            { title: 'Team-ready', text: 'Invite collaborators, assign tasks (PRO/TEAM).' }
          ].map((f) => (
            <div key={f.title} className="border rounded-xl p-4 bg-white">
              <div className="font-medium">{f.title}</div>
              <div className="text-sm text-slate-600 mt-1">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING (placeholder) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Simple pricing</h2>
        <div
          className="grid mt-6"
          style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '1rem' }}
        >
          {[
            {
              plan: 'FREE',
              price: '$0',
              bullets: ['Solo • up to 2 projects', 'Invoices (PDF)', 'Public portal (basic)']
            },
            {
              plan: 'PRO',
              price: '$9 / seat / mo',
              bullets: ['Up to 5 seats', 'Invoice email', 'GitHub import', 'Assignees & watchers']
            },
            {
              plan: 'TEAM',
              price: '$29 / seat / mo',
              bullets: ['Up to 25 seats', 'High limits', 'More controls']
            }
          ].map((p) => (
            <div key={p.plan} className="border rounded-xl p-4 bg-white">
              <div className="text-sm text-slate-500">{p.plan}</div>
              <div className="text-2xl font-semibold mt-1">{p.price}</div>
              <ul className="mt-3 text-sm text-slate-600 space-y-1">
                {p.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} DevCRM. All rights reserved.
      </footer>
    </div>
  )
}
