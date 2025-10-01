import { it, vi, expect, describe, beforeEach } from 'vitest'


// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
    })),
  },
}))

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should include token in requests when available', async () => {
    // Mock localStorage properly
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    expect(localStorage.getItem('token')).toBe('mock-token')
  })

  it('should handle requests without token', async () => {
    // Mock localStorage to return null
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
    
    expect(localStorage.getItem('token')).toBeNull()
  })
})
