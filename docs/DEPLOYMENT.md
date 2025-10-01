# Deployment Guide - Attijari Safe Admin Dashboard

## Overview

This guide covers various deployment options for the Attijari Safe Admin Dashboard, from development to production environments.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Backend API server running
- Domain name (for production)
- SSL certificate (for production)

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Attijari Safe Admin (Dev)
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=development
VITE_DEBUG=true
```

#### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.attijari-safe.com
VITE_APP_NAME=Attijari Safe Admin
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=production
VITE_DEBUG=false
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/admin/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}));
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides excellent support for React applications with automatic deployments.

#### Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://api.attijari-safe.com"
  }
}
```

#### GitHub Integration

1. Connect your GitHub repository to Vercel
2. Enable automatic deployments on push
3. Set up environment variables in Vercel dashboard

### 2. Netlify

Netlify offers simple static site hosting with form handling and serverless functions.

#### Setup

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_BASE_URL = "https://api.attijari-safe.com"
```

### 3. Docker Deployment

Docker provides containerized deployment for consistent environments.

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080
    depends_on:
      - backend

  backend:
    image: attijari-safe-backend:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DATABASE_URL=jdbc:postgresql://db:5432/attijari_safe
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=attijari_safe
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4. AWS S3 + CloudFront

For high-performance global deployment with CDN.

#### S3 Configuration

1. **Create S3 bucket**
   ```bash
   aws s3 mb s3://attijari-safe-admin
   ```

2. **Configure bucket for static website**
   ```bash
   aws s3 website s3://attijari-safe-admin --index-document index.html --error-document index.html
   ```

3. **Upload build files**
   ```bash
   npm run build
   aws s3 sync dist/ s3://attijari-safe-admin --delete
   ```

#### CloudFront Configuration

```json
{
  "Origins": [
    {
      "DomainName": "attijari-safe-admin.s3.amazonaws.com",
      "Id": "S3-attijari-safe-admin",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-attijari-safe-admin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }
  ]
}
```

## Build Process

### Production Build

```bash
# Install dependencies
npm ci

# Run tests
npm run test:run

# Build for production
npm run build

# Verify build
npm run start
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
  },
});
```

## Security Configuration

### HTTPS Setup

```nginx
# nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name admin.attijari-safe.com;
    
    ssl_certificate /etc/ssl/certs/attijari-safe.crt;
    ssl_certificate_key /etc/ssl/private/attijari-safe.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.attijari-safe.com;" always;
}
```

### Environment Security

```bash
# Set secure environment variables
export VITE_API_BASE_URL=https://api.attijari-safe.com
export VITE_APP_ENV=production
export VITE_DEBUG=false

# Use secrets management
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id attijari-safe/config

# HashiCorp Vault
vault kv get -field=api_url secret/attijari-safe/config
```

## Monitoring and Logging

### Application Monitoring

```typescript
// src/utils/monitoring.ts
export const monitoring = {
  trackPageView: (page: string) => {
    if (import.meta.env.PROD) {
      // Google Analytics
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href,
      });
    }
  },
  
  trackEvent: (action: string, category: string, label?: string) => {
    if (import.meta.env.PROD) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  },
  
  trackError: (error: Error, context?: string) => {
    console.error('Application Error:', error, context);
    
    if (import.meta.env.PROD) {
      // Send to error tracking service
      // Sentry, LogRocket, etc.
    }
  },
};
```

### Health Checks

```typescript
// src/utils/health.ts
export const healthCheck = {
  checkAPI: async () => {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  checkConnectivity: async () => {
    try {
      const response = await fetch('/api/ping');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:run
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run test:run
  artifacts:
    reports:
      junit: coverage/junit.xml

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://attijari-safe-admin --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
  only:
    - main
```

## Rollback Strategy

### Version Management

```bash
# Tag releases
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0

# Rollback to previous version
git checkout v1.9.0
npm run build
npm run deploy
```

### Blue-Green Deployment

```yaml
# docker-compose.blue-green.yml
version: '3.8'

services:
  app-blue:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080

  app-green:
    build: .
    ports:
      - "3001:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app-blue
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm install -g vite-bundle-analyzer
vite-bundle-analyzer dist

# Check for unused dependencies
npx depcheck
```

### Caching Strategy

```typescript
// Service worker for caching
// public/sw.js
const CACHE_NAME = 'attijari-safe-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check variable names (must start with VITE_)
   # Restart development server
   npm run dev
   ```

3. **Routing Issues**
   ```nginx
   # Ensure nginx serves index.html for all routes
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check environment
console.log('Environment:', import.meta.env);
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

## Maintenance

### Regular Updates

1. **Dependencies**
   ```bash
   # Check for updates
   npm outdated
   
   # Update dependencies
   npm update
   
   # Update major versions
   npx npm-check-updates -u
   npm install
   ```

2. **Security Audits**
   ```bash
   # Run security audit
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

3. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Check bundle size
   - Analyze loading times
   - Review error rates

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Performance metrics normal
- [ ] User acceptance testing complete

---

**Deployment is a critical process. Always test in staging before production! 🚀**



