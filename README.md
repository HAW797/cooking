# 🍳 Cooking App

Recipe sharing platform with community features.

## ⚡ Quick Start (3 Steps)

**What you need:** XAMPP (MySQL) + Node.js

### Step 1: Start XAMPP & Import Database

1. **Open XAMPP Control Panel** → Start **MySQL**
2. Open browser → Go to **http://localhost/phpmyadmin**
3. Click **"New"** → Type `cooking_app` → Click **"Create"**
4. Click on `cooking_app` → Click **"Import"** tab
5. Click **"Choose File"** → Select `/Applications/XAMPP/xamppfiles/cooking/backend/db.sql`
6. Click **"Import"** button at bottom
7. ✅ Done! Database created!

---

### Step 2: Start Backend

Open **Terminal** and run:

```bash
cd /Applications/XAMPP/xamppfiles/cooking/backend/public
/Applications/XAMPP/xamppfiles/bin/php -S localhost:8000
```

You should see:
```
[Fri Nov  7 13:45:00 2025] PHP 8.2.4 Development Server (http://localhost:8000) started
```

✅ **Backend running!** Keep this terminal open.

**If you see "Address already in use" error:**
```bash
# Find what's using port 8000
lsof -ti:8000

# Kill it (replace 12345 with the number you see)
kill 12345

# Then run the PHP server again
/Applications/XAMPP/xamppfiles/bin/php -S localhost:8000
```

---

### Step 3: Start Frontend

Open **NEW Terminal** and run:

```bash
cd /Applications/XAMPP/xamppfiles/cooking/frontend

# First time only - install dependencies:
npm install

# Start the app:
npm run dev
```

You should see:
```
▲ Next.js 15.5.4
- Local: http://localhost:3000
```

---

## 🎉 **DONE! Open Your App:**

**http://localhost:3000**

---

## 🔧 Common Issues:

### "Port 8000 already in use"
```bash
# Kill the old process
lsof -ti:8000 | xargs kill

# Start backend again
cd /Applications/XAMPP/xamppfiles/cooking/backend/public
/Applications/XAMPP/xamppfiles/bin/php -S localhost:8000
```

### "Database connection error"
- Make sure MySQL is running in XAMPP
- Open http://localhost/phpmyadmin to check database exists

### "npm: command not found"
Install Node.js: https://nodejs.org/

---

## 📱 What You Need Running:

| Service | Where | URL |
|---------|-------|-----|
| MySQL | XAMPP Control Panel | http://localhost/phpmyadmin |
| Backend | Terminal 1 | http://localhost:8000 |
| Frontend | Terminal 2 | http://localhost:3000 |

---

## 🛑 Stop Servers:

Press `Ctrl+C` in both terminals (backend & frontend)

---

## 🗄️ phpMyAdmin - Manage Database

**URL:** http://localhost/phpmyadmin

- View/edit all data
- Browse users and recipes
- Run SQL queries
- Export/Import backup

---

**That's it! Simple! 🚀**
