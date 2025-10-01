import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { it, vi, expect, describe, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { createTheme, ThemeProvider } from '@mui/material/styles'

import { AccountPopover } from '../account-popover'

// Mock axios
vi.mock('src/utils/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

// Mock useRouter and usePathname
vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}))

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      lighter: '#64b5f6',
      darker: '#1565c0',
      lighterChannel: '99 181 246',
      darkerChannel: '21 101 192',
    },
    warning: {
      main: '#ed6c02',
      lighter: '#ff9800',
      darker: '#e65100',
      lighterChannel: '255 152 0',
      darkerChannel: '230 81 0',
    },
  },
})

const renderWithRouter = (component: React.ReactElement) => render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      {component}
    </BrowserRouter>
  </ThemeProvider>
)

describe('AccountPopover', () => {
  let mockAxiosPost: any
  let mockPush: any

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.setItem('username', 'admin@test.com')
    
    // Get the mocked functions
    const axiosModule = await import('src/utils/axios')
    mockAxiosPost = axiosModule.default.post
    
    const routerModule = await import('src/routes/hooks')
    mockPush = routerModule.useRouter().push
  })

  it('displays admin username', () => {
    renderWithRouter(<AccountPopover data={[]} />)
    
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('shows logout button', async () => {
    const user = userEvent.setup()
    renderWithRouter(<AccountPopover data={[]} />)
    
    // Click on the avatar to open popover
    const avatarButton = screen.getByRole('button')
    await user.click(avatarButton)
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('handles logout successfully', async () => {
    const user = userEvent.setup()
    mockAxiosPost.mockResolvedValueOnce({ status: 200 })
    
    renderWithRouter(<AccountPopover data={[]} />)
    
    // Click on the avatar to open popover
    const avatarButton = screen.getByRole('button')
    await user.click(avatarButton)
    
    // Click logout button
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith('/api/logout')
      expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated')
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('username')
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
  })

  it('handles logout even if API fails', async () => {
    const user = userEvent.setup()
    mockAxiosPost.mockRejectedValueOnce(new Error('API Error'))

    renderWithRouter(<AccountPopover data={[]} />)
    
    // Click on the avatar to open popover
    const avatarButton = screen.getByRole('button')
    await user.click(avatarButton)
    
    // Click logout button
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated')
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('username')
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
  })
})