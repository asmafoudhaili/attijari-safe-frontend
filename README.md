# Attijari Safe Admin Dashboard

A modern React-based admin dashboard for monitoring and managing security logs, built with Material-UI and TypeScript.

## 🚀 Features

- **Secure Authentication** - JWT-based login/logout system
- **Real-time Logs Monitoring** - View phishing, ransomware, DoS, and code safety logs
- **Advanced Filtering & Sorting** - Filter by probability ranges and sort by time
- **Reclamation Management** - Handle user reclamations and threat reports
- **User Management** - Admin user interface
- **Responsive Design** - Works on desktop and mobile devices
- **Tunisia Localization** - Default Tunisia flag and localization support

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Backend API server running (Spring Boot)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attijari-safe-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_APP_NAME=Attijari Safe Admin
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── chart/          # Chart components
│   ├── iconify/        # Icon components
│   ├── label/          # Label components
│   └── logo/           # Logo components
├── layouts/            # Layout components
│   ├── auth/           # Authentication layout
│   ├── dashboard/      # Main dashboard layout
│   └── components/     # Layout-specific components
├── pages/              # Page components
├── routes/             # Routing configuration
├── sections/           # Feature-specific sections
│   ├── auth/           # Authentication pages
│   ├── logs/           # Logs management
│   ├── reclamation/    # Reclamation management
│   └── user/           # User management
├── theme/              # Material-UI theme configuration
├── utils/              # Utility functions
└── _mock/              # Mock data for development
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run e2e` - Open Cypress E2E tests
- `npm run e2e:run` - Run E2E tests headless
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🔐 Authentication

The dashboard uses JWT-based authentication:

1. **Login** - Enter admin credentials
2. **Token Storage** - JWT token stored in localStorage
3. **Auto-logout** - Automatic logout on token expiration
4. **Protected Routes** - All dashboard routes require authentication

### Default Admin Credentials
```
Email: admin@attijari.com
Password: admin123
```

## 📊 Dashboard Features

### Logs Management
- **Phishing Logs** - Monitor phishing attempts
- **Ransomware Logs** - Track ransomware activities
- **DoS Logs** - Monitor denial-of-service attacks
- **Code Safety Logs** - Review code security issues

### Filtering & Sorting
- **Probability Filter** - Filter by threat probability (High: 80-100%, Medium: 50-79%, Low: <50%)
- **Time Sorting** - Sort by newest/oldest first
- **Search** - Search through log entries

### Reclamation Management
- **View Reclamations** - See all user reclamations
- **Threat Types** - Categorize by threat type
- **User Actions** - Handle reclamation actions

## 🧪 Testing

The project includes comprehensive testing:

### Unit Tests
```bash
npm run test:run
```

### E2E Tests
```bash
# Start dev server first
npm run dev

# In another terminal
npm run e2e:run
```

### Test Coverage
- Authentication components
- Logs table functionality
- API integration
- User interactions
- Error handling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set these in your production environment:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

### Deployment Options
- **Vercel** - Recommended for React apps
- **Netlify** - Static site hosting
- **Docker** - Containerized deployment

## 🔌 API Integration

The dashboard integrates with a Spring Boot backend:

### Endpoints
- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/logs` - Fetch security logs
- `GET /api/reclamations` - Fetch reclamations

### Authentication Headers
```javascript
Authorization: Bearer <jwt-token>
```

## 🎨 Customization

### Theme
Modify `src/theme/` to customize:
- Colors
- Typography
- Component styles
- Layout spacing

### Localization
Add new languages in `src/_mock/_data.ts`:
```javascript
export const _langs = [
  {
    value: 'tn',
    label: 'Tunisia',
    icon: '/assets/icons/flags/ic-flag-tn.svg',
  },
  // Add more languages...
];
```

## 🐛 Troubleshooting

### Common Issues

1. **Login not working**
   - Check backend API is running
   - Verify API URL in environment variables
   - Check browser console for errors

2. **Logs not loading**
   - Verify authentication token
   - Check API endpoint responses
   - Review network tab in browser dev tools

3. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v2.0.0** - Current version with full feature set
- **v1.0.0** - Initial release

---

**Built with ❤️ for Attijari Bank Security Team**