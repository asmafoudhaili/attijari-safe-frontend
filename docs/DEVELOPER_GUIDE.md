# Developer Guide - Attijari Safe Admin Dashboard

## Architecture Overview

The Attijari Safe Admin Dashboard is built with modern React patterns and follows a component-based architecture.

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + Cypress
- **Styling**: Emotion (CSS-in-JS)

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── chart/          # Chart components (recharts)
│   ├── iconify/        # Icon components
│   ├── label/          # Label components
│   ├── logo/           # Logo components
│   ├── scrollbar/      # Custom scrollbar
│   └── svg-color/      # SVG color utilities
├── layouts/            # Layout components
│   ├── auth/           # Authentication layout
│   ├── dashboard/      # Main dashboard layout
│   ├── simple/         # Simple layout
│   └── components/     # Layout-specific components
├── pages/              # Page components
├── routes/             # Routing configuration
├── sections/           # Feature-specific sections
│   ├── auth/           # Authentication
│   ├── logs/           # Logs management
│   ├── reclamation/    # Reclamation management
│   └── user/           # User management
├── theme/              # Material-UI theme
├── utils/              # Utility functions
└── _mock/              # Mock data
```

## Development Setup

### Prerequisites

- Node.js 20.x+
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd attijari-safe-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Attijari Safe Admin
VITE_APP_VERSION=2.0.0
```

## Code Organization

### Component Structure

Each component follows this structure:

```typescript
// Component imports
import React from 'react';
import { Box, Typography } from '@mui/material';

// Type definitions
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Component definition
export function Component({ title, onAction }: ComponentProps) {
  // Hooks
  const [state, setState] = useState('');

  // Event handlers
  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  // Render
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
}
```

### State Management

The application uses React hooks for state management:

```typescript
// Local state
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// Derived state
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// Effects
useEffect(() => {
  fetchData();
}, []);
```

### API Integration

API calls are handled through Axios with interceptors:

```typescript
// utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);
```

## Component Development

### Creating New Components

1. **Create component file**
   ```typescript
   // src/components/NewComponent.tsx
   import React from 'react';
   import { Box } from '@mui/material';

   interface NewComponentProps {
     // Define props
   }

   export function NewComponent({}: NewComponentProps) {
     return <Box>New Component</Box>;
   }
   ```

2. **Add to index file**
   ```typescript
   // src/components/index.ts
   export { NewComponent } from './NewComponent';
   ```

3. **Create tests**
   ```typescript
   // src/components/__tests__/NewComponent.test.tsx
   import { render, screen } from '@testing-library/react';
   import { NewComponent } from '../NewComponent';

   describe('NewComponent', () => {
     it('renders correctly', () => {
       render(<NewComponent />);
       expect(screen.getByText('New Component')).toBeInTheDocument();
     });
   });
   ```

### Material-UI Integration

#### Theme Customization

```typescript
// src/theme/create-theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

#### Component Styling

```typescript
// Using sx prop
<Box
  sx={{
    p: 2,
    backgroundColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  }}
>
  Content
</Box>

// Using styled components
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
}));
```

## Routing

### Route Configuration

```typescript
// src/routes/sections.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInView />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Protected Routes

```typescript
// src/routes/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" />;
}
```

## Testing

### Unit Testing

```typescript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = vi.fn();
    
    render(<Component onAction={mockHandler} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### E2E Testing

```typescript
// cypress/e2e/feature.cy.ts
describe('Feature', () => {
  it('completes user workflow', () => {
    cy.visit('/');
    cy.get('[data-testid="button"]').click();
    cy.url().should('include', '/success');
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  onAction();
}, [onAction]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
});
```

## Error Handling

### Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// utils/api.ts
export async function apiCall<T>(url: string): Promise<T> {
  try {
    const response = await axiosInstance.get<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}
```

## Deployment

### Build Process

```bash
# Production build
npm run build

# Preview build
npm run start
```

### Environment Configuration

```typescript
// src/config-global.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  version: import.meta.env.VITE_APP_VERSION,
};
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Code Quality

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Prettier Configuration

```json
// prettier.config.mjs
export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
};
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## Debugging

### Development Tools

1. **React Developer Tools**
   - Install browser extension
   - Inspect component state and props

2. **Redux DevTools** (if using Redux)
   - Time-travel debugging
   - State inspection

3. **Network Tab**
   - Monitor API calls
   - Check request/response data

### Debug Logging

```typescript
// utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

## Contributing

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**
   ```bash
   git push origin feature/new-feature
   ```

### Commit Convention

```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code refactoring
test: adding tests
chore: maintenance
```

### Code Review Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is implemented
- [ ] Performance considerations addressed

---

## Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Testing Library](https://testing-library.com/)

---

**Happy Coding! 🚀**



