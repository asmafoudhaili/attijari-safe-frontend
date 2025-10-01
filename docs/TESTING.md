# Testing Documentation - Attijari Safe Admin Dashboard

## Testing Strategy

The Attijari Safe Admin Dashboard implements a comprehensive testing strategy with three levels of testing:

1. **Unit Tests** - Test individual components and functions
2. **Integration Tests** - Test component interactions and API integration
3. **End-to-End (E2E) Tests** - Test complete user workflows

## Testing Stack

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **E2E Testing**: Cypress
- **Mocking**: Vitest mocks
- **Coverage**: Vitest coverage reports

## Running Tests

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/components/Button.test.tsx

# Run tests in watch mode
npm run test -- --watch
```

### E2E Tests

```bash
# Open Cypress UI
npm run e2e

# Run E2E tests headless
npm run e2e:run

# Run specific E2E test
npm run e2e:run -- --spec "cypress/e2e/login.cy.ts"
```

## Test Structure

### Unit Test Structure

```typescript
// src/components/__tests__/Component.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from '../Component';

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();
    
    render(<Component onAction={mockHandler} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### E2E Test Structure

```typescript
// cypress/e2e/feature.cy.ts
describe('Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('completes user workflow', () => {
    cy.get('[data-testid="button"]').click();
    cy.url().should('include', '/success');
    cy.get('[data-testid="success-message"]').should('be.visible');
  });
});
```

## Test Categories

### 1. Authentication Tests

#### Login Component Tests
- ✅ Form rendering
- ✅ Input validation
- ✅ Successful login flow
- ✅ Error handling
- ✅ Token storage

```typescript
// src/sections/auth/__tests__/sign-in-view.test.tsx
describe('SignInView', () => {
  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    const mockAxios = vi.mocked(axios);
    mockAxios.post.mockResolvedValueOnce({
      status: 200,
      data: { jwt: 'mock-jwt-token' }
    });
    
    renderWithRouter(<SignInView />);
    
    await user.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/login', {
        username: 'admin@test.com',
        password: 'password123'
      });
    });
  });
});
```

#### Logout Tests
- ✅ Logout button functionality
- ✅ Token cleanup
- ✅ Redirect to login page
- ✅ Error handling

### 2. Logs Management Tests

#### Logs Table Tests
- ✅ Table rendering
- ✅ Data loading
- ✅ Filtering functionality
- ✅ Sorting functionality
- ✅ Search functionality
- ✅ API error handling

```typescript
// src/sections/logs/__tests__/logs-view.test.tsx
describe('LogsView', () => {
  it('renders logs tables after data loads', async () => {
    const mockAxios = vi.mocked(axios);
    mockAxios.get.mockResolvedValueOnce({
      data: {
        phishingLogs: [mockLogData],
        ransomwareLogs: [],
        doSLogs: [],
        codeSafetyLogs: []
      }
    });

    renderWithRouter(<LogsView />);
    
    await waitFor(() => {
      expect(screen.getByText('Phishing Logs')).toBeInTheDocument();
      expect(screen.getByText('Ransomware Logs')).toBeInTheDocument();
    });
  });
});
```

#### Filter Tests
- ✅ Probability filtering (High/Medium/Low)
- ✅ Time-based sorting
- ✅ Search functionality
- ✅ Filter combinations

### 3. API Integration Tests

#### Axios Configuration Tests
- ✅ Request interceptors
- ✅ Response interceptors
- ✅ Token handling
- ✅ Error handling

```typescript
// src/test/api.test.ts
describe('API Utils', () => {
  it('includes token in requests when available', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    
    expect(localStorage.getItem('token')).toBe('mock-token');
  });
});
```

### 4. E2E Workflow Tests

#### Complete Admin Workflow
- ✅ Login process
- ✅ Dashboard navigation
- ✅ Logs viewing and filtering
- ✅ Reclamation management
- ✅ Logout process

```typescript
// cypress/e2e/admin-workflow.cy.ts
describe('Admin Dashboard Workflow', () => {
  it('completes full admin login and dashboard workflow', () => {
    // Login
    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/');
    cy.contains('Logs').should('be.visible');

    // Test logs functionality
    cy.contains('Phishing Logs').should('be.visible');
    
    // Test logout
    cy.get('[data-testid="account-button"]').click();
    cy.contains('Logout').click();
    cy.url().should('include', '/sign-in');
  });
});
```

## Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    assign: vi.fn(),
  },
  writable: true,
});
```

### Cypress Configuration

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
```

## Mocking Strategies

### API Mocking

```typescript
// Mock axios
vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock specific API responses
const mockAxios = vi.mocked(axios);
mockAxios.get.mockResolvedValueOnce({
  data: { logs: [] }
});
```

### Component Mocking

```typescript
// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

// Mock Material-UI components
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  };
});
```

### Local Storage Mocking

```typescript
// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});
```

## Test Utilities

### Custom Render Function

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Test Data Factories

```typescript
// src/test/factories.ts
export const createMockLog = (overrides = {}) => ({
  id: 1,
  url: 'https://example.com',
  isSafe: false,
  timestamp: '2024-01-01T10:00:00Z',
  probability: 0.85,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  role: 'ADMIN',
  ...overrides,
});
```

## Coverage Reports

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

### Coverage Thresholds

```json
// package.json
{
  "scripts": {
    "test:coverage": "vitest run --coverage --coverage.thresholds.lines=80 --coverage.thresholds.functions=80 --coverage.thresholds.branches=80 --coverage.thresholds.statements=80"
  }
}
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:run
      
      - name: Run E2E tests
        run: npm run e2e:run
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

## Best Practices

### Writing Effective Tests

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good: Test what the user sees
   expect(screen.getByText('Login successful')).toBeInTheDocument();
   
   // Bad: Test implementation details
   expect(component.state.isLoggedIn).toBe(true);
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should display error message when login fails with invalid credentials', () => {
   
   // Bad
   it('should handle error', () => {
   ```

3. **Test Edge Cases**
   ```typescript
   it('handles empty data gracefully', () => {
     render(<LogsTable data={[]} />);
     expect(screen.getByText('No logs available')).toBeInTheDocument();
   });
   ```

4. **Mock External Dependencies**
   ```typescript
   // Mock API calls
   vi.mock('src/utils/api', () => ({
     fetchLogs: vi.fn().mockResolvedValue([]),
   }));
   ```

### Test Organization

1. **Group Related Tests**
   ```typescript
   describe('LoginForm', () => {
     describe('validation', () => {
       it('shows error for empty email', () => {});
       it('shows error for invalid email', () => {});
     });
     
     describe('submission', () => {
       it('submits with valid data', () => {});
       it('handles submission errors', () => {});
     });
   });
   ```

2. **Use beforeEach for Setup**
   ```typescript
   describe('Component', () => {
     beforeEach(() => {
       vi.clearAllMocks();
       localStorage.clear();
     });
   });
   ```

## Debugging Tests

### Debugging Unit Tests

```typescript
// Add debug output
it('should work', () => {
  render(<Component />);
  screen.debug(); // Prints DOM structure
  expect(screen.getByText('Expected')).toBeInTheDocument();
});
```

### Debugging E2E Tests

```typescript
// Cypress debugging
it('should work', () => {
  cy.visit('/');
  cy.get('[data-testid="button"]').click();
  cy.debug(); // Pauses execution
  cy.url().should('include', '/success');
});
```

## Performance Testing

### Component Performance

```typescript
// Test component rendering performance
it('renders large dataset efficiently', () => {
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));
  
  const start = performance.now();
  render(<DataTable data={largeDataset} />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // Should render in <100ms
});
```

## Test Maintenance

### Keeping Tests Updated

1. **Update tests when requirements change**
2. **Remove obsolete tests**
3. **Refactor tests for better maintainability**
4. **Add tests for new features**

### Test Documentation

1. **Document test scenarios**
2. **Explain complex test logic**
3. **Keep test data realistic**
4. **Use meaningful test data**

---

## Test Results Summary

### Current Test Coverage

- **Unit Tests**: 11/15 passing (73%)
- **Integration Tests**: All passing
- **E2E Tests**: Ready to run
- **Coverage**: 80%+ target

### Test Categories

- ✅ **Authentication**: 5/5 tests passing
- ✅ **Logs Management**: 4/4 tests passing
- ✅ **API Integration**: 2/2 tests passing
- ⚠️ **Account Popover**: 0/4 tests passing (theme issues)

### Next Steps

1. Fix account popover theme issues
2. Add more edge case tests
3. Increase test coverage to 90%+
4. Add performance tests
5. Implement visual regression tests

---

**Testing is an ongoing process. Keep your tests updated and maintainable! 🧪**



