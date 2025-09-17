// Mirror lisible côté front (ne remplace pas le back)
export type Plan = 'FREE' | 'PRO' | 'TEAM'
export const planRank: Record<Plan, number> = { FREE: 1, PRO: 2, TEAM: 3 }
export const hasPlanAtLeast = (p: Plan | undefined, min: Plan) =>
  p ? (planRank[p] ?? 0) >= planRank[min] : false

// Limites pour l’UX (le back reste source de vérité)
export const planLimits: Record<Plan, { projectsMax: number; seats: number }> = {
  FREE: { projectsMax: 2, seats: 1 },
  PRO: { projectsMax: 50, seats: 5 },
  TEAM: { projectsMax: 1000, seats: 25 }
}

// Capacités UX
export const gates = {
  canAssignOthers: (p?: Plan) => hasPlanAtLeast(p, 'PRO'),
  hasWatchers: (p?: Plan) => hasPlanAtLeast(p, 'PRO')
}
