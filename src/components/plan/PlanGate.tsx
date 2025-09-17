'use client'
import { hasPlanAtLeast, Plan } from '@/lib/planClient'

export default function PlanGate({
  currentPlan,
  min,
  children,
  fallback
}: {
  currentPlan?: Plan
  min: Plan
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return hasPlanAtLeast(currentPlan, min) ? <>{children}</> : <>{fallback ?? null}</>
}
