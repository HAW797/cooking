# 🚀 Quick Start Guide

Get your cooking app up and running in 5 minutes!

## Prerequisites

- PHP 7.4+ with PDO MySQL extension
- MySQL 5.7+ or MariaDB
- Node.js 18+ or Bun
- Terminal/Command Line

## Step 1: Setup Backend (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Import database
mysql -u root -p < db.sql
# Enter your MySQL password when prompted

# Update database credentials (if needed)
# Edit config.php and update:
# - DB_HOST (default: 127.0.0.1)
# - DB_NAME (default: cooking_app)
# - DB_USER (default: root)
# - DB_PASS (default: root)

# Start PHP server
php -S localhost:8000 -t public
```

✅ Backend is now running at: **http://localhost:8000**

Keep this terminal window open!

## Step 2: Setup Frontend (2 minutes)

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (choose one)
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

✅ Frontend is now running at: **http://localhost:3000**

## Step 3: Test the Connection (1 minute)

### Option A: Use the Web Interface

1. Open http://localhost:3000 in your browser
2. Try to register a new account or log in
3. If successful, you're all set! 🎉

### Option B: Test API Directly

```bash
# Test backend API (in a new terminal)
curl http://localhost:8000/api/recipes.php

# Expected response: JSON with recipes list
```

## 🎯 Default Test Credentials

If your database has seed data, you can use these credentials:

- **Email**: `demo@foodfusion.com`
- **Password**: `demo123`

(These are mock credentials from the old implementation. Register a new account if they don't work.)

## 📝 What You've Built

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Frontend (Next.js)     Backend (PHP)          │
│  http://localhost:3000  http://localhost:8000   │
│           │                    │                │
│           │   API Requests     │                │
│           ├───────────────────>│                │
│           │                    │                │
│           │   JSON Response    │                │
│           │<───────────────────┤                │
│           │                    │                │
│                                ▼                │
│                           MySQL Database        │
│                           (cooking_app)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔑 Key Features Now Available

### ✅ Authentication
- User registration with backend database
- Login with token-based authentication
- Secure logout with token revocation
- Password reset functionality

### ✅ Recipes
- Browse public recipes from database
- Filter by cuisine, dietary, and difficulty
- Rate and review recipes
- View detailed recipe information

### ✅ Community Cookbook
- Create your own recipes (requires login)
- Edit and delete your recipes
- Like other users' recipes
- Share recipes with the community

### ✅ Resources
- Access culinary resources
- Download educational PDFs
- Filter by resource type

### ✅ Contact
- Send messages via contact form
- Messages stored in database
- Subject categorization

## 📂 Project Structure

```
cooking/
├── backend/                    # PHP Backend
│   ├── api/
│   │   └── bootstrap.php      # API configuration & helpers
│   ├── config.php             # Database configuration
│   ├── db.sql                 # Database schema
│   └── public/
│       └── api/               # API endpoints
│           ├── login.php
│           ├── register.php
│           ├── recipes.php
│           └── ...
│
├── frontend/                   # Next.js Frontend
│   ├── lib/
│   │   ├── config.ts          # API configuration
│   │   ├── api-client.ts      # HTTP client
│   │   ├── auth.ts            # Auth utilities
│   │   └── api/               # API services
│   │       ├── auth.service.ts
│   │       ├── recipes.service.ts
│   │       └── ...
│   ├── contexts/
│   │   └── auth-context.tsx   # Auth React context
│   └── app/                   # Next.js pages
│
├── INTEGRATION_GUIDE.md        # Detailed documentation
├── QUICK_START.md              # This file
└── EXAMPLE_USAGE.tsx           # Code examples
```

## 🛠️ Common Issues & Solutions

### Backend won't start

**Error**: `Address already in use`

**Solution**: 
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
php -S localhost:8001 -t public
# Then update NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

### Database connection error

**Error**: `SQLSTATE[HY000] [1045] Access denied`

**Solution**:
1. Verify MySQL is running: `mysql -u root -p`
2. Check credentials in `backend/config.php`
3. Ensure database exists: `SHOW DATABASES;`
4. Import schema if missing: `mysql -u root -p < db.sql`

### CORS errors in browser

**Error**: `Access-Control-Allow-Origin` error

**Solution**:
1. Ensure backend is running
2. Check backend logs for errors
3. Verify CORS settings in `backend/api/bootstrap.php`
4. Clear browser cache and reload

### Frontend won't start

**Error**: `Cannot find module` or dependency errors

**Solution**:
```bash
# Clear and reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# or with bun
rm -rf node_modules
rm bun.lockb
bun install
```

### API returns 404

**Problem**: API endpoints not found

**Solution**:
1. Verify backend is running on correct port
2. Check `NEXT_PUBLIC_API_BASE_URL` in frontend
3. Test backend directly: `curl http://localhost:8000/api/recipes.php`
4. Ensure you're starting PHP server from correct directory with `-t public` flag

## 🔍 Verify Everything Works

Run these tests to confirm the integration:

### 1. Test Backend API

```bash
# Get all recipes
curl http://localhost:8000/api/recipes.php

# Get cuisines
curl http://localhost:8000/api/lookups.php

# Register user
curl -X POST http://localhost:8000/api/register.php \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","password":"test123"}'
```

### 2. Test Frontend

1. Visit http://localhost:3000
2. Click "Sign Up" or "Login"
3. Register a new account
4. Browse recipes
5. Create a new recipe (requires login)

### 3. Check Database

```bash
mysql -u root -p cooking_app

# List all users
SELECT * FROM user;

# List all recipes
SELECT * FROM recipe;

# List user sessions (tokens)
SELECT * FROM user_session;
```

## 📚 Next Steps

Now that you have the integration working, explore:

1. **[Integration Guide](INTEGRATION_GUIDE.md)** - Comprehensive documentation
2. **[Example Usage](EXAMPLE_USAGE.tsx)** - Code examples and patterns
3. **[Backend API Docs](backend/README_API.md)** - All API endpoints
4. **[API Services Reference](frontend/lib/api/README.md)** - Frontend API usage

## 💡 Pro Tips

1. **Development Workflow**:
   ```bash
   # Terminal 1: Backend
   cd backend && php -S localhost:8000 -t public
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   
   # Terminal 3: Database (optional)
   mysql -u root -p cooking_app
   ```

2. **API Testing**: Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)
   - Import `frontend/Cooking.postman_collection.json`

3. **Debugging**:
   - Backend: Check PHP error logs
   - Frontend: Use browser DevTools Network tab
   - Database: Use MySQL Workbench or phpMyAdmin

4. **Environment Variables**:
   ```bash
   # Frontend: Create .env.local
   echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > frontend/.env.local
   ```

## 🎓 Learning Resources

- [PHP PDO Tutorial](https://www.php.net/manual/en/book.pdo.php)
- [Next.js Documentation](https://nextjs.org/docs)
- [REST API Best Practices](https://restfulapi.net/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 🤝 Need Help?

1. Check [Troubleshooting](#-common-issues--solutions) section
2. Review [Integration Guide](INTEGRATION_GUIDE.md)
3. Examine code examples in [EXAMPLE_USAGE.tsx](EXAMPLE_USAGE.tsx)
4. Check browser console for errors
5. Verify both servers are running

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database created and schema imported
- [ ] Can register a new user
- [ ] Can login with user credentials
- [ ] Can view recipes list
- [ ] Can create a new recipe (when logged in)
- [ ] No CORS errors in browser console
- [ ] API calls return valid JSON responses

---

**Congratulations!** 🎉 Your PHP backend is now fully integrated with your Next.js frontend!

Time to start building amazing features! 🚀

