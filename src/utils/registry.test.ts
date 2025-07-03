// src/utils/registry.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchComponentConfig } from './registry.js'

describe('Registry', () => {
  it('should fetch component config', async () => {
    // Mock axios
    vi.mock('axios', () => ({
      default: {
        get: vi.fn().mockResolvedValue({
          data: { name: 'bar-chart', version: '1.0.0' }
        })
      }
    }))

    const config = await fetchComponentConfig('bar-chart')
    expect(config).toEqual({ name: 'bar-chart', version: '1.0.0' })
  })
})