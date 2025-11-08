# How to Test Events CRUD in Postman

## Prerequisites
1. Make sure your PHP server is running: `php -S localhost:8000 -t public` (from backend directory)
2. Make sure you have a user account registered

---

## Step 1: Login to Get Auth Token

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/login.php`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "YourPassword123!"
}
```

**Save the token from response:**
```json
{
  "success": true,
  "data": {
    "token": "COPY_THIS_TOKEN"
  }
}
```

---

## Step 2: Test Events CRUD

### 1. GET All Events (No Auth Required)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/events.php`
- **Headers:** None needed

**Expected:** Returns list of all events

---

### 2. GET Single Event by ID (No Auth Required)

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/events.php?id=1`
- **Headers:** None needed

**Expected:** Returns single event with ID 1

---

### 3. GET Filtered Events (No Auth Required)

**Upcoming Events:**
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/events.php?filter=upcoming`

**Past Events:**
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/events.php?filter=past`

---

### 4. POST - Create Event (Auth Required)

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/events.php`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (raw JSON):**
```json
{
  "event_title": "Cooking Workshop",
  "event_date": "2025-12-20 14:00:00",
  "location": "Community Center",
  "description": "Learn basic cooking techniques",
  "image_url": "https://example.com/image.jpg"
}
```

**Date Format Options:**
- `"2025-12-20 14:00:00"` ✅
- `"2025-12-20T14:00:00"` ✅
- `"2025-12-20"` ✅

**Expected Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event_id": 1,
    "event": { ... }
  }
}
```

**Save the `event_id` for UPDATE and DELETE tests**

---

### 5. PUT - Update Event (Auth Required)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:8000/api/events.php?id=1` (use the event_id from POST)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (raw JSON):**
```json
{
  "event_title": "Updated Cooking Workshop",
  "location": "New Location",
  "description": "Updated description"
}
```

**Note:** You can update only specific fields (partial update)

**Expected Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "event": { ... }
  }
}
```

---

### 6. DELETE - Delete Event (Auth Required)

**Request:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8000/api/events.php?id=1` (use the event_id)
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

**Expected Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Quick Test Flow

1. **Login** → Copy token
2. **POST** → Create event → Copy `event_id`
3. **GET** → List all events → Verify your event appears
4. **GET** → Get single event by ID → Verify details
5. **PUT** → Update event → Verify changes
6. **GET** → Get single event → Verify update
7. **DELETE** → Delete event
8. **GET** → Get single event → Should return 404

---

## Common Errors

### 401 Unauthorized
- **Problem:** Missing or invalid token
- **Solution:** Make sure you included `Authorization: Bearer YOUR_TOKEN` header

### 404 Not Found
- **Problem:** Event ID doesn't exist
- **Solution:** Use a valid event_id

### 422 Validation Error
- **Problem:** Missing required fields or invalid date format
- **Solution:** Make sure `event_title` and `event_date` are provided

### 405 Method Not Allowed
- **Problem:** Wrong HTTP method
- **Solution:** Check if you're using GET, POST, PUT, or DELETE correctly

---

## Postman Tips

1. **Save Token as Variable:**
   - After login, save the token as an environment variable
   - Use `{{token}}` in Authorization header

2. **Create Collection:**
   - Create a Postman collection for Events API
   - Organize requests by operation (GET, POST, PUT, DELETE)

3. **Use Pre-request Script:**
   - Automatically get token before each authenticated request

4. **Test Scripts:**
   - Add tests to verify response status codes
   - Verify response structure

