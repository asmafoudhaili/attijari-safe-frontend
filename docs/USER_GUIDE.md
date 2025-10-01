# User Guide - Attijari Safe Admin Dashboard

## Getting Started

### First Time Login

1. **Open the Dashboard**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to the login page

2. **Enter Credentials**
   - Email: `admin@attijari.com`
   - Password: `admin123`

3. **Access Dashboard**
   - After successful login, you'll see the main dashboard

## Dashboard Overview

### Navigation Menu

The dashboard has a sidebar navigation with the following sections:

- **🏠 Home** - Dashboard overview
- **📊 Logs** - Security logs monitoring
- **📝 Reclamations** - User reclamations management
- **👥 User** - User management
- **🌐 Language** - Language selection (Tunisia default)

### Header Bar

- **Refresh Button** - Reload current data
- **Account Menu** - User profile and logout
- **Notifications** - System alerts and updates

## Logs Management

### Viewing Logs

1. **Navigate to Logs**
   - Click "Logs" in the sidebar
   - You'll see four types of logs:
     - Phishing Logs
     - Ransomware Logs
     - DoS Logs
     - Code Safety Logs

2. **Understanding Log Data**
   - **URL/Details**: The suspicious URL or code
   - **Safe**: Whether the item is marked as safe
   - **Time**: When the log was created
   - **Probability**: Threat probability (0-100%)

### Filtering Logs

#### Probability Filter
- **High (80-100%)**: High-risk threats
- **Medium (50-79%)**: Medium-risk threats
- **Low (<50%)**: Low-risk threats
- **All**: Show all logs

#### Search Filter
- Type in the search box to find specific URLs or details
- Search is case-insensitive

#### Sorting
- **Newest First**: Most recent logs first
- **Oldest First**: Oldest logs first

### Example: Filtering High-Risk Phishing

1. Go to "Phishing Logs" section
2. Select "High" from the Probability dropdown
3. Click the filter button
4. View only high-risk phishing attempts

## Reclamations Management

### Viewing Reclamations

1. **Navigate to Reclamations**
   - Click "Reclamations" in the sidebar
   - View all pending user reclamations

2. **Reclamation Details**
   - **URL/Details**: What the user reported
   - **Threat Type**: Category of threat
   - **User**: Who reported it
   - **Actions**: Available actions

### Handling Reclamations

#### Resolve a Reclamation
1. Click "Resolve" button
2. Add notes if needed
3. Confirm the action

#### Reject a Reclamation
1. Click "Reject" button
2. Provide reason for rejection
3. Confirm the action

## User Management

### Viewing Users
1. Click "User" in the sidebar
2. View all registered users
3. See user details and status

### User Actions
- **Edit User**: Modify user information
- **Deactivate**: Disable user account
- **View Activity**: See user's security activities

## Account Management

### Profile Information
- Click on your avatar in the top-right corner
- View your admin profile
- See your username and role

### Logout
1. Click on your avatar
2. Click "Logout" button
3. You'll be redirected to the login page

## Language Settings

### Changing Language
1. Click the language flag in the header
2. Select your preferred language
3. The interface will update immediately

### Available Languages
- 🇹🇳 Tunisia (Default)
- 🇺🇸 English
- 🇫🇷 French
- 🇩🇪 German
- 🇪🇸 Spanish

## Best Practices

### Daily Workflow

1. **Morning Check**
   - Review overnight logs
   - Check for high-priority reclamations
   - Verify system status

2. **Log Analysis**
   - Focus on high-probability threats first
   - Investigate suspicious patterns
   - Update threat classifications

3. **Reclamation Handling**
   - Process reclamations promptly
   - Provide clear feedback to users
   - Document resolution actions

### Security Tips

1. **Regular Logout**
   - Always logout when finished
   - Don't leave dashboard open unattended

2. **Data Privacy**
   - Handle user data responsibly
   - Follow company privacy policies

3. **Threat Response**
   - Act quickly on high-risk threats
   - Escalate critical issues immediately

## Troubleshooting

### Common Issues

#### Can't Login
- Check your credentials
- Ensure backend server is running
- Clear browser cache and try again

#### Logs Not Loading
- Check your internet connection
- Verify backend API is accessible
- Try refreshing the page

#### Slow Performance
- Clear browser cache
- Close unnecessary browser tabs
- Check system resources

### Getting Help

1. **Check Browser Console**
   - Press F12 to open developer tools
   - Look for error messages in Console tab

2. **Contact Support**
   - Create a support ticket
   - Include error messages and steps to reproduce

3. **System Status**
   - Check if backend services are running
   - Verify network connectivity

## Keyboard Shortcuts

- **Ctrl + R**: Refresh current page
- **Ctrl + F**: Search in current page
- **Escape**: Close modals/dropdowns
- **Tab**: Navigate between form fields

## Mobile Usage

### Responsive Design
- Dashboard works on tablets and phones
- Touch-friendly interface
- Optimized for mobile viewing

### Mobile Tips
- Use landscape mode for better table viewing
- Pinch to zoom for detailed log inspection
- Swipe to navigate between sections

## Data Export

### Exporting Logs
1. Apply desired filters
2. Click "Export" button
3. Choose format (CSV, JSON)
4. Download the file

### Exporting Reclamations
1. Go to Reclamations page
2. Select date range
3. Click "Export" button
4. Download the report

## Notifications

### System Alerts
- High-risk threat detected
- New reclamation submitted
- System maintenance scheduled
- Security policy updates

### Notification Settings
- Configure alert preferences
- Set notification frequency
- Choose notification channels

## Performance Tips

### Optimizing Dashboard
1. **Use Filters**: Filter data to reduce load
2. **Limit Date Ranges**: Don't load too much historical data
3. **Regular Refresh**: Keep data current
4. **Close Unused Tabs**: Free up browser resources

### Browser Recommendations
- **Chrome**: Best performance and compatibility
- **Firefox**: Good alternative
- **Safari**: Works well on Mac
- **Edge**: Compatible with Windows

---

## Quick Reference

### Login Credentials
```
Email: admin@attijari.com
Password: admin123
```

### Key URLs
- Dashboard: `http://localhost:3000`
- Login: `http://localhost:3000/sign-in`
- Logs: `http://localhost:3000/logs`
- Reclamations: `http://localhost:3000/reclamations`

### Support Contacts
- Technical Support: support@attijari.com
- Security Team: security@attijari.com
- Emergency: +216 XX XXX XXX

---

**Last Updated**: January 2024  
**Version**: 2.0.0



