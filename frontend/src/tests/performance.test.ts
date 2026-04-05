/**
 * A performance check.
 * Not a benchmark — just verifies that the filter/sort computed
 * property runs fast enough to not cause UI lag on a realistic dataset.
 */

import { describe, it, expect } from 'vitest'
import { useZones } from '@/composables/useZones'
import type { ZoneSummary } from '@/types/zone'
import type { ZoneType, ZoneStatus } from '@/types/zone'

// Generate a large realistic dataset to stress-test the computed property
function makeZones(count: number): ZoneSummary[] {
  const types:    ZoneType[]   = ['commercial', 'street', 'residential']
  const statuses: ZoneStatus[] = ['active', 'limited', 'seasonal', 'inactive']

  return Array.from({ length: count }, (_, i) => ({
    id:     i + 1,
    name:   `Parking Zone ${i + 1} Helsinki`,
    type:   types[i % types.length],
    status: statuses[i % statuses.length],
  }))
}

describe('useZones — filter performance', () => {

  it('filters and sorts 500 zones in under 20ms', () => {
    const composable = useZones()
    composable.zones.value       = makeZones(500)
    composable.search.value      = 'Helsinki'
    composable.filterType.value  = 'commercial'
    composable.sortDir.value     = 'desc'

    const start  = performance.now()
    const result = composable.filteredZones.value  // trigger computed
    const elapsed = performance.now() - start

    // Functional check — result should be filtered correctly
    expect(result.every(z => z.type === 'commercial')).toBe(true)
    expect(result.every(z => z.name.toLowerCase().includes('helsinki'))).toBe(true)

    // Performance check — should complete well under any animation frame (16ms)
    expect(elapsed).toBeLessThan(20)

    console.log(`  ⚡ 500-zone filter+sort completed in ${elapsed.toFixed(2)}ms`)
  })

})
