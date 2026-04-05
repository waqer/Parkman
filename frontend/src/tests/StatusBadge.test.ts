/**
 * Tests that StatusBadge renders the correct label and colour
 * for each zone status.
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/StatusBadge.vue'
import { STATUS_META } from '@/utils/constants'
import type { ZoneStatus } from '@/types/zone'

// Helper: convert "#00875A" → "rgb(0, 135, 90)"
// Browsers normalise hex colours to rgb() in inline styles,
// so we compare in the same format the DOM actually produces.
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

describe('StatusBadge', () => {

  it('renders the correct label for each status', () => {
    const statuses: ZoneStatus[] = ['active', 'limited', 'seasonal', 'inactive']

    for (const status of statuses) {
      const wrapper = mount(StatusBadge, { props: { status } })
      expect(wrapper.text().toLowerCase()).toBe(STATUS_META[status].label.toLowerCase())
    }
  })

  it('applies the correct colour from STATUS_META', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'active' } })
    const style   = wrapper.find('.badge').attributes('style') ?? ''

    // Compare in rgb() format — the browser converts hex automatically
    expect(style).toContain(hexToRgb(STATUS_META.active.color))
  })

  it('falls back gracefully for an unknown status', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'unknown' as ZoneStatus },
    })
    expect(wrapper.find('.badge').exists()).toBe(true)
  })

})