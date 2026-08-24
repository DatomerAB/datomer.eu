import { useMemo } from 'react'
import { analytics } from '../analytics/analytics.js'

const STORAGE_KEY = 'par-experiments'
const VISITOR_KEY = 'par-visitor-id'

function getVisitorId() {
  if (typeof localStorage === 'undefined' || !localStorage?.getItem) return null
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

function stableBucket(visitorId, testName, variants) {
  const str = `${visitorId}:${testName}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return variants[Math.abs(hash) % variants.length]
}

export function getVariant(testName, variants = ['control', 'treatment']) {
  const visitorId = getVisitorId()
  if (!visitorId) return variants[0]

  let all = {}
  try {
    all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    all = {}
  }

  if (all[testName]) return all[testName]

  const variant = stableBucket(visitorId, testName, variants)
  all[testName] = variant
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  analytics.track('experiment_assigned', { experiment: testName, variant })
  return variant
}

export function useExperiment(testName, variants = ['control', 'treatment']) {
  return useMemo(() => getVariant(testName, variants), [testName, variants.join(',')])
}
