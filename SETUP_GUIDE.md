# 🚀 Cooking App - Setup & Run Guide

## Prerequisites
- ✅ XAMPP installed (for MySQL database)
- ✅ PHP 8.0+ (included with XAMPP)
- ✅ Node.js 18+ (for frontend)
- ✅ Bun or npm (package manager)

---

## 📦 Step 1: Database Setup

### 1.1 Start MySQL
```bash
# Start MySQL using XAMPP
sudo /Applications/XAMPP/xamppfiles/xampp startmysql
```

### 1.2 Create Database & Import Schema
```bash
# Access MySQL
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p

# At the MySQL prompt:
CREATE DATABASE IF NOT EXISTS cooking_app;
USE cooking_app;

# Exit MySQL
exit;
```

### 1.3 Import the database schema
```bash
cd /Users/sittthihanaing/Documents/cooking/backend
/Applications/XAMPP/xamppfiles/bin/mysql -u root -p cooking_app < db.sql
```

**Note:** Default MySQL password in XAMPP is usually empty. If prompted, try pressing Enter or use `root`.

---

## 🔧 Step 2: Backend Setup (PHP API)

### 2.1 Verify Database Configuration
Check that `/Users/sittthihanaing/Documents/cooking/backend/config.php` has correct credentials:
```php
const DB_HOST = '127.0.0.1';
const DB_NAME = 'cooking_app';
const DB_USER = 'root';
const DB_PASS = 'root';  // Change if your MySQL password is different
```

### 2.2 Start PHP Backend Server
```bash
cd /Users/sittthihanaing/Documents/cooking/backend/public
php -S localhost:8000
```

You should see:
```
[Wed Nov 5 14:30:00 2025] PHP 8.2.4 Development Server (http://localhost:8000) started
```

**✅ Backend is now running on:** `http://localhost:8000`

### 2.3 Test Backend API
Open a new terminal and test:
```bash
curl http://localhost:8000/api/lookups.php
```

---

## 🎨 Step 3: Frontend Setup (Next.js)

### 3.1 Install Dependencies
```bash
cd /Users/sittthihanaing/Documents/cooking/frontend
bun install
# or if using npm:
# npm install
```

### 3.2 Create Environment File
Create `.env.local` file in the frontend directory:
```bash
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8000' > .env.local
```

### 3.3 Start Frontend Development Server
```bash
# In the frontend directory
bun dev
# or
# npm run dev
```

You should see:
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

**✅ Frontend is now running on:** `http://localhost:3000`

---

## 🔗 Step 4: Verify Connection

### Open your browser and test:

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8000/api/lookups.php

### Test with Postman Collection

1. Open Postman
2. Import `frontend/Cooking.postman_collection.json`
3. Create an environment variable:
   - Variable: `base_url`
   - Value: `http://localhost:8000`
4. Test the "Register" endpoint to create a user
5. Test the "List Lookups" endpoint

---

## 📝 Quick Start Commands

### Terminal 1: Start MySQL (if not running)
```bash
sudo /Applications/XAMPP/xamppfiles/xampp startmysql
```

### Terminal 2: Start Backend
```bash
cd /Users/sittthihanaing/Documents/cooking/backend/public
php -S localhost:8000
```

### Terminal 3: Start Frontend
```bash
cd /Users/sittthihanaing/Documents/cooking/frontend
bun dev
```

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: "Connection refused" or database errors**
```bash
# Check if MySQL is running
/Applications/XAMPP/xamppfiles/xampp status

# Start MySQL if needed
sudo /Applications/XAMPP/xamppfiles/xampp startmysql
```

**Problem: "Port 8000 already in use"**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
php -S localhost:8001
# Then update frontend .env.local to use port 8001
```

### Frontend Issues

**Problem: "API request failed"**
- Verify backend is running on port 8000
- Check `.env.local` has correct API URL
- Check browser console for CORS errors

**Problem: "Module not found"**
```bash
cd /Users/sittthihanaing/Documents/cooking/frontend
rm -rf node_modules bun.lockb
bun install
```

### CORS Issues
Backend is configured to allow:
- `http://localhost:3000` (default Next.js port)
- `http://localhost:3001` (alternative port)
- All origins in development mode

---

## 🎯 Available API Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/register.php` | POST | No | Register new user |
| `/api/login.php` | POST | No | Login user |
| `/api/logout.php` | POST | Yes | Logout user |
| `/api/recipes.php` | GET | Yes | Get all recipes |
| `/api/lookups.php` | GET | Yes | Get cuisines, dietaries, etc. |
| `/api/cookbook.php` | GET | Yes | Get user's cookbook |
| `/api/cookbook_like.php` | POST | Yes | Like/unlike recipe |
| `/api/resources.php` | GET | Yes | Get educational resources |
| `/api/contact.php` | POST | No | Submit contact form |
| `/downloads/*.pdf` | GET | No | Download PDF resources |

---

## 📦 Full Stack Architecture

```
┌─────────────────────┐      HTTP/JSON      ┌──────────────────────┐
│   Next.js Frontend  │ ◄─────────────────► │   PHP Backend API    │
│   localhost:3000    │                      │   localhost:8000     │
└─────────────────────┘                      └──────────┬───────────┘
                                                        │
                                                        │ PDO
                                                        ▼
                                             ┌──────────────────────┐
                                             │   MySQL Database     │
                                             │   cooking_app        │
                                             └──────────────────────┘
```

---

## ✨ Next Steps

1. Register a new user through the frontend
2. Browse recipes
3. Add recipes to cookbook
4. Download educational resources

**Happy Cooking! 👨‍🍳**




