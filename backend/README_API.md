# Cooking App - Backend API

Base URL: `http://localhost:8000`

All endpoints return JSON. Include `Content-Type: application/json` for POST/PUT.
CORS is enabled for demo.

## Response Format

**Success Response:**
```json
{
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "error": "Error message"
}
```

## Authentication Endpoints

### Register User
- **POST** `/api/register.php`
- **Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "email": "john@example.com"
  }
}
```

### Login
- **POST** `/api/login.php`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "data": {
    "token": "abc123...",
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }
}
```

### Logout
- **POST** `/api/logout.php`
- **Header (Optional):** `Authorization: Bearer <token>`
  - Token is optional - if provided, it will be revoked
  - If no token provided, still returns success
- **Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Forgot Password
- **POST** `/api/forgot_password.php`
- **Body:**
```json
{
  "email": "john@example.com",
  "new_password": "newpass123"
}
```
- **Response:**
```json
{
  "message": "Password updated successfully"
}
```

## Lookups Endpoint

### Get Filter Options (Cuisines, Dietaries, Difficulties, Contact Subjects)
- **GET** `/api/lookups.php`
- **Response:**
```json
{
  "message": "Lookup data retrieved successfully",
  "data": {
    "cuisines": [
      { "cuisine_type_id": 1, "cuisine_name": "Italian" },
      ...
    ],
    "dietaries": [
      { "dietary_id": 1, "dietary_name": "None" },
      ...
    ],
    "difficulties": [
      { "difficulty_id": 1, "difficulty_level": "Easy" },
      ...
    ],
    "subjects": [
      { "subject_id": 1, "subject_name": "General Inquiry" },
      { "subject_id": 2, "subject_name": "Recipe Question" },
      { "subject_id": 3, "subject_name": "Technical Support" },
      { "subject_id": 4, "subject_name": "Feedback" },
      { "subject_id": 5, "subject_name": "Partnership" },
      { "subject_id": 6, "subject_name": "Other" }
    ]
  }
}
```

## Recipes Endpoints

### Get All Recipes
- **GET** `/api/recipes.php`

### Get Filtered Recipes
- **GET** `/api/recipes.php?cuisine_type_id=1&dietary_id=2&difficulty_id=1`

- **Response:**
```json
{
  "message": "Recipes retrieved successfully",
  "data": {
    "items": [
      {
        "recipe_id": 1,
        "recipe_title": "Spaghetti Pomodoro",
        "description": "Classic tomato pasta",
        "cuisine_name": "Italian",
        "dietary_name": "None",
        "difficulty_level": "Easy",
        ...
      }
    ],
    "count": 2
  }
}
```

## Resources Endpoints

### Get All Resources
- **GET** `/api/resources.php`

### Get Filtered Resources
- **GET** `/api/resources.php?type=Culinary`
- **GET** `/api/resources.php?type=Educational`

- **Response:**
```json
{
  "message": "Resources retrieved successfully",
  "data": {
    "items": [
      {
        "resource_id": 1,
        "title": "Knife Skills 101",
        "description": "PDF on knife safety and cuts",
        "resource_type": "Culinary",
        "file_url": "/public/downloads/knife-skills.pdf",
        ...
      }
    ],
    "count": 2
  }
}
```

- **Note:** File URLs are downloadable. Access via: `http://localhost:8000/public/downloads/knife-skills.pdf`

## Subjects Endpoint

### Get All Contact Subjects
- **GET** `/api/subjects.php`
- **Response:**
```json
{
  "message": "Subjects retrieved successfully",
  "data": {
    "subjects": [
      { "subject_id": 1, "subject_name": "General Inquiry" },
      { "subject_id": 2, "subject_name": "Recipe Question" },
      { "subject_id": 3, "subject_name": "Technical Support" },
      { "subject_id": 4, "subject_name": "Feedback" },
      { "subject_id": 5, "subject_name": "Partnership" },
      { "subject_id": 6, "subject_name": "Other" }
    ],
    "count": 6
  }
}
```

## Contact Endpoint

### Send Contact Message
- **POST** `/api/contact.php`
- **Body (Option 1 - with subject_id):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject_id": 1,
  "message": "Hello, I have a question..."
}
```
- **Body (Option 2 - with subject text):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Hello, I have a question..."
}
```
- **Note:** You can get available subjects from `/api/subjects.php` or `/api/lookups.php` endpoint
- **Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "message_id": 1
  }
}
```

## Community Cookbook Endpoints (Requires Authentication)

All endpoints require header: `Authorization: Bearer <token>`

### List User's Recipes
- **GET** `/api/cookbook.php`
- **Response:**
```json
{
  "message": "Recipes retrieved successfully",
  "data": {
    "items": [...],
    "count": 5
  }
}
```

### Create Recipe
- **POST** `/api/cookbook.php`
- **Body:**
```json
{
  "recipe_title": "My Noodles",
  "description": "Quick and tasty",
  "image_url": "https://example.com/image.jpg",
  "cuisine_type_id": 1,
  "dietary_id": 1,
  "difficulty_id": 1,
  "prep_time": 10,
  "cook_time": 20,
  "servings": 2,
  "instructions": "Boil noodles, stir-fry, mix together"
}
```
- **Response:**
```json
{
  "message": "Recipe created successfully",
  "data": {
    "post_id": 1
  }
}
```

### Update Recipe
- **PUT** `/api/cookbook.php?id=1`
- **Body:** (same as create, title required)
```json
{
  "recipe_title": "My Better Noodles",
  "servings": 3
}
```
- **Response:**
```json
{
  "message": "Recipe updated successfully"
}
```

### Delete Recipe
- **DELETE** `/api/cookbook.php?id=1`
- **Response:**
```json
{
  "message": "Recipe deleted successfully"
}
```

## How to Run

1. **Setup Database:**
   ```bash
   mysql -u root -p < db.sql
   ```

2. **Configure Database:**
   - Edit `config.php` and update DB credentials if needed

3. **Start Server:**
   ```bash
   php -S localhost:8000 -t public
   ```

4. **Test API:**
   - Use Postman or curl to test endpoints
   - Base URL: `http://localhost:8000`

## Code Structure

- **`api/bootstrap.php`** - Bootstrap file with helper functions (CORS, JSON response, auth helpers)
- **`config.php`** - Database configuration
- **`db.sql`** - Database schema and seed data
- **`public/api/*.php`** - API endpoints

All code is clean, well-commented, and easy to understand. Each endpoint has clear documentation at the top.