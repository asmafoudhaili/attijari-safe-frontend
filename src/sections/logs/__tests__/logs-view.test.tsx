import { BrowserRouter } from 'react-router-dom'
import { it, vi, expect, describe, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { LogsView } from '../view/logs-view'

// Mock axios
vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock useRouter
vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const renderWithRouter = (component: React.ReactElement) => render(
  <BrowserRouter>
    {component}
  </BrowserRouter>
)

describe('LogsView', () => {
  let mockAxiosGet: any
  let mockPush: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Get the mocked functions
    const axiosModule = await import('src/utils/axios')
    mockAxiosGet = axiosModule.default.get
    
    const routerModule = await import('src/routes/hooks')
    mockPush = routerModule.useRouter().push
  })

  it('renders logs page', () => {
    renderWithRouter(<LogsView />)
    
    expect(screen.getByText('Logs')).toBeInTheDocument()
  })

  it('displays logs after loading', async () => {
    const mockLogs = [
      {
        id: '1',
        type: 'PHISHING',
        url: 'http://example.com',
        probability: 0.85,
        timestamp: '2024-01-01 10:00:00',
        isSafe: false
      }
    ]
    
    mockAxiosGet.mockResolvedValueOnce({ data: mockLogs })
    
    renderWithRouter(<LogsView />)
    
    // Wait for the data to load and be displayed
    await waitFor(() => {
      expect(screen.getByText('Phishing Logs')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // The logs should be displayed in the table
    await waitFor(() => {
      expect(screen.getByText('http://example.com')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('handles API error', async () => {
    const error = new Error('API Error') as any
    error.response = { status: 401 }
    mockAxiosGet.mockRejectedValueOnce(error)
    
    renderWithRouter(<LogsView />)
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated')
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('username')
    })
  })
})