# API Documentation

## Overview

The Attijari Safe Admin Dashboard integrates with a Spring Boot backend API for authentication and data management.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All API requests (except login) require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Authentication

#### POST /api/login
Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin@attijari.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin@attijari.com",
  "role": "ADMIN"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

#### POST /api/logout
Logout current user and invalidate session.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### Logs Management

#### GET /api/logs
Fetch all security logs with optional filtering.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `type` (optional): Filter by log type (`phishing`, `ransomware`, `dos`, `codeSafety`)
- `probability` (optional): Filter by probability range (`high`, `medium`, `low`)
- `sort` (optional): Sort order (`newest`, `oldest`)

**Response (200 OK):**
```json
{
  "phishingLogs": [
    {
      "id": 1,
      "url": "https://phishing-site.com",
      "isSafe": false,
      "timestamp": "2024-01-01T10:00:00Z",
      "probability": 0.85
    }
  ],
  "ransomwareLogs": [],
  "doSLogs": [],
  "codeSafetyLogs": []
}
```

### Reclamations

#### GET /api/reclamations
Fetch all user reclamations.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "details": "{\"url\": \"https://suspicious-site.com\"}",
    "threatType": "phishing",
    "user": "user@example.com",
    "timestamp": "2024-01-01T10:00:00Z",
    "status": "pending"
  }
]
```

#### PUT /api/reclamations/{id}/resolve
Resolve a reclamation.

**Request Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "action": "resolved",
  "notes": "Threat confirmed and blocked"
}
```

**Response (200 OK):**
```json
{
  "message": "Reclamation resolved successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized access",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Data Models

### Log Entry
```typescript
interface LogEntry {
  id: number;
  url?: string;
  isSafe: boolean;
  timestamp: string;
  probability: number; // 0-1 range
  anomalyScore?: number; // For code safety logs
}
```

### Reclamation
```typescript
interface Reclamation {
  id: number;
  details: string; // JSON string
  threatType: 'phishing' | 'ransomware' | 'dos' | 'codeSafety';
  user: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'rejected';
}
```

### User
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}
```

## Rate Limiting

- **Login attempts**: 5 attempts per minute per IP
- **API requests**: 100 requests per minute per user
- **Log fetching**: 10 requests per minute per user

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://your-domain.com` (production)

## WebSocket Support

Real-time updates are available via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/logs');
ws.onmessage = (event) => {
  const logUpdate = JSON.parse(event.data);
  // Handle real-time log updates
};
```

## Testing

### Postman Collection
Import the provided Postman collection for API testing:
- `docs/postman/Attijari-Safe-API.postman_collection.json`

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@attijari.com","password":"admin123"}'
```

**Fetch Logs:**
```bash
curl -X GET http://localhost:8080/api/logs \
  -H "Authorization: Bearer <jwt-token>"
```

**Logout:**
```bash
curl -X POST http://localhost:8080/api/logout \
  -H "Authorization: Bearer <jwt-token>"
```

## Security Considerations

1. **JWT Expiration**: Tokens expire after 24 hours
2. **Password Policy**: Minimum 8 characters, mixed case, numbers
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: All inputs are validated and sanitized
5. **SQL Injection**: Protected with parameterized queries
6. **XSS Protection**: Output encoding and CSP headers

## Monitoring

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T10:00:00Z",
  "version": "1.0.0"
}
```

### Metrics
- Request count
- Response times
- Error rates
- Active users

## Changelog

### v1.0.0
- Initial API release
- Authentication endpoints
- Logs management
- Reclamations system

---

For more information, contact the development team or check the backend repository documentation.



