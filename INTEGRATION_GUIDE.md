# Backend-Frontend Integration Guide

This guide explains how the PHP backend is connected with the Next.js frontend using best practices.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Usage Examples](#usage-examples)
- [Environment Configuration](#environment-configuration)
- [CORS Configuration](#cors-configuration)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### Backend (PHP)
- **Location**: `/backend/`
- **Server**: PHP built-in server (development)
- **Base URL**: `http://localhost:8000`
- **Database**: MySQL (cooking_app)
- **Authentication**: Bearer token-based

### Frontend (Next.js)
- **Location**: `/frontend/`
- **Framework**: Next.js 15 with React 19
- **Base URL**: `http://localhost:3000`
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create database and import schema
mysql -u root -p < db.sql

# Update database credentials if needed
# Edit config.php and update:
# - DB_HOST
# - DB_NAME
# - DB_USER
# - DB_PASS

# Start PHP server
php -S localhost:8000 -t public
```

The backend will be running at: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
bun install

# Create environment variables (optional)
# The app uses default values if not provided
# Create .env.local with:
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
# or
bun dev
```

The frontend will be running at: `http://localhost:3000`

## 🔌 API Integration

### File Structure

```
frontend/lib/
├── config.ts                 # API configuration
├── api-client.ts            # HTTP client with error handling
├── api/
│   ├── index.ts            # Main export file
│   ├── auth.service.ts     # Authentication endpoints
│   ├── recipes.service.ts  # Recipes endpoints
│   ├── cookbook.service.ts # Cookbook endpoints
│   ├── resources.service.ts # Resources endpoints
│   ├── lookups.service.ts  # Lookup data endpoints
│   └── contact.service.ts  # Contact form endpoint
└── auth.ts                  # Auth utilities
```

### API Client Features

- ✅ Automatic token management
- ✅ Request/response interceptors
- ✅ Error handling with types
- ✅ Timeout support (10 seconds default)
- ✅ Network error detection
- ✅ TypeScript type safety

## 🔐 Authentication Flow

### 1. User Login

```typescript
import { authService } from '@/lib/api'

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Response includes token and user data
if (response.data) {
  const { token, user } = response.data
  // Token is automatically stored in localStorage
}
```

### 2. Authenticated Requests

```typescript
import { cookbookService } from '@/lib/api'

// Token is automatically included in all requests
const recipes = await cookbookService.getCookbookRecipes()
```

### 3. Logout

```typescript
import { authService } from '@/lib/api'

// Revokes token on backend and clears local storage
await authService.logout()
```

## 💻 Usage Examples

### Using Services in Components

```typescript
'use client'

import { useEffect, useState } from 'react'
import { recipesService, type Recipe } from '@/lib/api'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await recipesService.getRecipes({
          cuisine_type_id: 1,
          difficulty_id: 1
        })
        
        if (response.data) {
          setRecipes(response.data.items)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {recipes.map(recipe => (
        <div key={recipe.recipe_id}>{recipe.recipe_title}</div>
      ))}
    </div>
  )
}
```

### Using Auth Context

```typescript
'use client'

import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login, user, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const result = await login(
      formData.get('email') as string,
      formData.get('password') as string
    )

    if (result.success) {
      console.log('Logged in as:', user?.name)
    } else {
      console.error(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Creating a New Recipe

```typescript
import { cookbookService } from '@/lib/api'

async function createRecipe() {
  try {
    const response = await cookbookService.createRecipe({
      recipe_title: 'My Amazing Recipe',
      description: 'A delicious dish',
      cuisine_type_id: 1,
      dietary_id: 1,
      difficulty_id: 2,
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      instructions: 'Step 1: Mix ingredients...'
    })

    console.log('Recipe created with ID:', response.data?.post_id)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}
```

### Error Handling

```typescript
import { recipesService, type ApiError } from '@/lib/api'

try {
  const response = await recipesService.getRecipes()
  // Handle success
} catch (error) {
  const apiError = error as ApiError
  
  switch (apiError.status) {
    case 401:
      // Unauthorized - redirect to login
      router.push('/login')
      break
    case 404:
      // Not found
      console.error('Resource not found')
      break
    case 408:
      // Timeout
      console.error('Request timed out')
      break
    case 0:
      // Network error
      console.error('Network error - check your connection')
      break
    default:
      console.error(apiError.message)
  }
}
```

## ⚙️ Environment Configuration

### Development

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Production

Update `.env.production`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourproductiondomain.com
NEXT_PUBLIC_API_TIMEOUT=15000
```

### Configuration File

All settings are centralized in `frontend/lib/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
  endpoints: {
    login: '/api/login.php',
    register: '/api/register.php',
    // ... other endpoints
  }
}
```

## 🌐 CORS Configuration

### Backend (PHP)

The backend CORS is configured in `backend/api/bootstrap.php`:

```php
// Development - allows all origins
header('Access-Control-Allow-Origin: *');

// Production - allow specific origins
$allowedOrigins = [
    'http://localhost:3000',
    'https://yourproductiondomain.com',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}
```

**For Production**: Update `$allowedOrigins` array with your production domain.

### Next.js Rewrites (Optional)

Next.js can proxy API requests to avoid CORS issues. Configured in `next.config.mjs`:

```javascript
async rewrites() {
  return [
    {
      source: '/api-backend/:path*',
      destination: 'http://localhost:8000/api/:path*',
    },
  ]
}
```

To use rewrites, update `API_CONFIG.baseURL` to use relative paths.

## 🚀 Production Deployment

### 1. Backend Deployment

1. **Deploy PHP Backend** to a hosting service (e.g., shared hosting, VPS, DigitalOcean)
2. **Configure Database** with production credentials
3. **Update CORS** in `bootstrap.php` with production domain
4. **Enable HTTPS** for secure API communication
5. **Update `.htaccess`** for proper routing (if using Apache)

```apache
# .htaccess for Apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ api/$1.php [L]
</IfModule>
```

### 2. Frontend Deployment

1. **Update environment variables**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.yourproductiondomain.com
   ```

2. **Build the Next.js app**:
   ```bash
   npm run build
   ```

3. **Deploy to hosting** (Vercel, Netlify, etc.):
   - Vercel: Connect GitHub repo and deploy
   - Manual: Deploy the `.next` folder and run `npm start`

### 3. Security Checklist

- ✅ Use HTTPS for both frontend and backend
- ✅ Configure proper CORS with specific domains
- ✅ Use environment variables for sensitive data
- ✅ Implement rate limiting on the backend
- ✅ Validate and sanitize all user inputs
- ✅ Use secure session tokens (already implemented)
- ✅ Regular security updates for dependencies

## 🔧 Troubleshooting

### CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**:
1. Check backend CORS configuration in `bootstrap.php`
2. Ensure frontend origin is in `$allowedOrigins` array
3. Verify backend server is running
4. Check browser console for exact error message

### Authentication Issues

**Problem**: "Invalid or expired token" error

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Login again to get a fresh token
3. Check token expiry (30 days by default)
4. Verify backend database has `user_session` table

### Connection Refused

**Problem**: `ERR_CONNECTION_REFUSED` or network error

**Solution**:
1. Verify backend server is running: `php -S localhost:8000 -t public`
2. Check `NEXT_PUBLIC_API_BASE_URL` is correct
3. Ensure firewall isn't blocking port 8000
4. Test backend directly: `curl http://localhost:8000/api/recipes.php`

### Request Timeout

**Problem**: Requests timing out after 10 seconds

**Solution**:
1. Increase timeout in config: `NEXT_PUBLIC_API_TIMEOUT=30000`
2. Check backend performance and database queries
3. Verify network connection stability
4. Add indexes to frequently queried database columns

### TypeScript Errors

**Problem**: Type errors in API responses

**Solution**:
1. Check API response matches type definitions
2. Update type definitions in service files
3. Use `console.log()` to inspect actual API responses
4. Ensure backend returns consistent data structure

## 📚 Additional Resources

- [Backend API Documentation](backend/README_API.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🤝 Best Practices Implemented

1. **Separation of Concerns**: API logic separated from UI components
2. **Type Safety**: Full TypeScript types for API requests/responses
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Security**: Token-based authentication with secure storage
5. **Performance**: Request timeout and caching strategies
6. **Maintainability**: Clean, documented, and modular code structure
7. **Scalability**: Easy to add new endpoints and services

## 📝 Next Steps

1. **Testing**: Add unit tests for API services
2. **Monitoring**: Implement error tracking (e.g., Sentry)
3. **Caching**: Add React Query or SWR for data caching
4. **Optimization**: Implement request debouncing and caching
5. **Documentation**: Add JSDoc comments to all functions
6. **CI/CD**: Set up automated deployment pipeline

---

**Questions or Issues?** Check the troubleshooting section or review the code comments for detailed explanations.

