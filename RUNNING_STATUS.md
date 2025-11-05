# ✅ Cooking App - Running Status

## Current Status (Nov 5, 2025)

### 🟢 Frontend: **RUNNING**
- **URL:** http://localhost:3000
- **Framework:** Next.js 15.5.4
- **Status:** ✅ Successfully running
- **Title:** FoodFusion - Your Culinary Community Hub

### 🟡 Backend: **RUNNING** (but needs MySQL)
- **URL:** http://localhost:8000
- **Framework:** PHP 8.2.4 with built-in server
- **Status:** ⚠️ Running but needs MySQL database connection
- **Note:** API endpoints will work once MySQL is started

### 🔴 Database: **NOT RUNNING**
- **Server:** MySQL (XAMPP)
- **Status:** ❌ Needs to be started
- **Database Name:** cooking_app

---

## 🚀 How to Start Everything

### 1. Start MySQL (Required - Run this first!)
```bash
sudo /Applications/XAMPP/xamppfiles/xampp startmysql
```
Enter your Mac password when prompted.

### 2. Verify Servers are Running
```bash
# Check if backend and frontend are running
lsof -i :8000 -i :3000
```

**Expected output:**
```
COMMAND     PID   USER   FD   TYPE  DEVICE  NODE  NAME
node      xxxxx  user   16u  IPv6  ...     TCP   *:hbci (LISTEN)      <- Frontend
php       xxxxx  user    7u  IPv6  ...     TCP   localhost:irdmi      <- Backend
```

### 3. Access the Application

**Frontend (Web Interface):**
- Open browser: http://localhost:3000

**Backend API:**
- Test endpoint: http://localhost:8000/api/lookups.php

---

## 🧪 Testing the Connection

### Quick Test with curl:
```bash
# Test backend lookups endpoint
curl http://localhost:8000/api/lookups.php

# Test register endpoint
curl -X POST http://localhost:8000/api/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test with Postman:
1. Import: `frontend/Cooking.postman_collection.json`
2. Create environment variable: `base_url` = `http://localhost:8000`
3. Run the "Register" request
4. Run the "List Lookups" request

---

## 🔄 If Something Stops Working

### Restart Backend
```bash
# Kill existing PHP server
pkill -f "php -S localhost:8000"

# Start again
cd /Users/sittthihanaing/Documents/cooking/backend/public
/Applications/XAMPP/xamppfiles/bin/php -S localhost:8000 &
```

### Restart Frontend
```bash
# Kill existing Next.js server
pkill -f "next dev"

# Start again
cd /Users/sittthihanaing/Documents/cooking/frontend
bun dev &
```

### Check MySQL Status
```bash
/Applications/XAMPP/xamppfiles/xampp status
```

---

## 📱 Application Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│              http://localhost:3000                           │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ Frontend fetches data from backend
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND SERVER                         │
│              Port 3000                                       │
│  • React Components                                          │
│  • Server-side rendering                                     │
│  • API calls to backend                                      │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTP/JSON API Requests
                   │ (using fetch from lib/api-client.ts)
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              PHP BACKEND API                                 │
│              Port 8000                                       │
│  • /api/register.php                                         │
│  • /api/login.php                                            │
│  • /api/recipes.php                                          │
│  • /api/cookbook.php                                         │
│  • /api/resources.php                                        │
│  • etc.                                                      │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ PDO Database Connection
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              MYSQL DATABASE                                  │
│              Port 3306 (default)                             │
│  Database: cooking_app                                       │
│  User: root / Pass: root                                     │
│  • user table                                                │
│  • recipes table                                             │
│  • cookbook table                                            │
│  • resources table                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Environment Configuration

### Backend Configuration
**File:** `/backend/config.php`
```php
const DB_HOST = '127.0.0.1';
const DB_NAME = 'cooking_app';
const DB_USER = 'root';
const DB_PASS = 'root';
```

### Frontend Configuration
**File:** `/frontend/.env.local`
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 🎯 Next Steps

1. ✅ Frontend is running - you can browse to http://localhost:3000
2. ✅ Backend is running - ready to serve API requests
3. ⚠️ **Start MySQL** using: `sudo /Applications/XAMPP/xamppfiles/xampp startmysql`
4. 🧪 Test the full stack by registering a user in the frontend

**Once MySQL is running, your full application will be functional!**

---

## 💡 Useful Commands

```bash
# Check what's running on ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :3306  # MySQL

# View server logs (if running in background)
tail -f /tmp/php-server.log   # Backend
tail -f /tmp/next-dev.log     # Frontend

# Stop servers
pkill -f "php -S localhost:8000"  # Stop backend
pkill -f "next dev"               # Stop frontend
```

---

**🎉 Happy Coding!**




