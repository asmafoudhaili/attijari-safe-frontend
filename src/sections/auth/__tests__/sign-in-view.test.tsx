import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { it, vi, expect, describe, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import { SignInView } from '../sign-in-view'

// Mock axios
vi.mock('src/utils/axios', () => ({
  default: {
    post: vi.fn(),
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

describe('SignInView', () => {
  let mockAxiosPost: any
  let mockPush: any

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Get the mocked functions
    const axiosModule = await import('src/utils/axios')
    mockAxiosPost = axiosModule.default.post
    
    const routerModule = await import('src/routes/hooks')
    mockPush = routerModule.useRouter().push
  })

  it('renders sign in form', () => {
    renderWithRouter(<SignInView />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles form input', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SignInView />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    mockAxiosPost.mockResolvedValueOnce({
      status: 200,
      data: { jwt: 'mock-token' }
    })
    
    renderWithRouter(<SignInView />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith('/api/login', {
        username: 'test@example.com',
        password: 'password123'
      })
      expect(localStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true')
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('username', 'test@example.com')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('handles login failure', async () => {
    const user = userEvent.setup()
    mockAxiosPost.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    renderWithRouter(<SignInView />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Invalid credentials')
    })
    
    alertSpy.mockRestore()
  })
})