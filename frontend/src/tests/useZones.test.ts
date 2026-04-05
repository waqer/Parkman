/**
 * Tests the filtering, searching and sorting logic inside useZones.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useZones } from '@/composables/useZones'
import type { ZoneSummary } from '@/types/zone'

// Sample data that mirrors what the PHP API returns
const SAMPLE_ZONES: ZoneSummary[] = [
  { id: 1, name: 'Kamppi Center',        type: 'commercial',  status: 'active'   },
  { id: 2, name: 'Esplanadi Park',        type: 'street',      status: 'active'   },
  { id: 3, name: 'Kallio Residential',    type: 'residential', status: 'active'   },
  { id: 4, name: 'Töölönlahti Waterfront',type: 'street',      status: 'limited'  },
  { id: 5, name: 'Pasila Hub Garage',     type: 'commercial',  status: 'active'   },
  { id: 6, name: 'Hernesaari Marina',     type: 'street',      status: 'seasonal' },
]

describe('useZones — filter, search and sort logic', () => {
  let composable: ReturnType<typeof useZones>

  beforeEach(() => {
    // Fresh composable instance with sample data loaded
    composable = useZones()
    composable.zones.value = [...SAMPLE_ZONES]
  })

  // ── Search ──────────────────────────────────────────────────────────────

  it('filters by search term (case-insensitive)', () => {
    composable.search.value = 'kamppi'
    expect(composable.filteredZones.value).toHaveLength(1)
    expect(composable.filteredZones.value[0].name).toBe('Kamppi Center')
  })

  it('returns all zones when search is empty', () => {
    composable.search.value = ''
    expect(composable.filteredZones.value).toHaveLength(SAMPLE_ZONES.length)
  })

  it('returns empty list when search matches nothing', () => {
    composable.search.value = 'xyz-no-match'
    expect(composable.filteredZones.value).toHaveLength(0)
  })

  // ── Type filter ─────────────────────────────────────────────────────────

  it('filters by zone type: commercial', () => {
    composable.filterType.value = 'commercial'
    const result = composable.filteredZones.value
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(z => z.type === 'commercial')).toBe(true)
  })

  it('filters by zone type: street', () => {
    composable.filterType.value = 'street'
    const result = composable.filteredZones.value
    expect(result.every(z => z.type === 'street')).toBe(true)
  })

  // ── Status filter ───────────────────────────────────────────────────────

  it('filters by status: limited', () => {
    composable.filterStatus.value = 'limited'
    const result = composable.filteredZones.value
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Töölönlahti Waterfront')
  })

  it('filters by status: seasonal', () => {
    composable.filterStatus.value = 'seasonal'
    const result = composable.filteredZones.value
    expect(result.every(z => z.status === 'seasonal')).toBe(true)
  })

  // ── Combined filters ────────────────────────────────────────────────────

  it('combines type and status filters correctly', () => {
    composable.filterType.value   = 'street'
    composable.filterStatus.value = 'active'
    const result = composable.filteredZones.value
    expect(result.every(z => z.type === 'street' && z.status === 'active')).toBe(true)
  })

  it('combines search with type filter', () => {
    composable.filterType.value = 'commercial'
    composable.search.value     = 'pasila'
    const result = composable.filteredZones.value
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Pasila Hub Garage')
  })

  // ── Sort ────────────────────────────────────────────────────────────────

  it('sorts A→Z by default', () => {
    const names = composable.filteredZones.value.map(z => z.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  it('toggleSort reverses to Z→A', () => {
    composable.toggleSort()
    const names = composable.filteredZones.value.map(z => z.name)
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })

  it('toggleSort twice returns to A→Z', () => {
    composable.toggleSort()
    composable.toggleSort()
    expect(composable.sortDir.value).toBe('asc')
  })

})
