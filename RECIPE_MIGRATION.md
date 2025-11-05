# Recipe Data Migration Guide

## Overview
This document describes the migration from mock recipe data to database-driven recipes.

## Changes Made

### 1. Frontend Updates

#### a. Recipe List Page (`/app/recipes/page.tsx`)
- **Before**: Used static `recipes` array from `@/lib/mock-data`
- **After**: Fetches recipes from backend API using `recipesService.getRecipes()`
- **Features**:
  - Loading state with spinner
  - Error handling with retry option
  - Dynamic filter options from API lookups
  - Real-time filtering and search

#### b. Recipe Detail Page (`/app/recipes/[id]/page.tsx`)
- **Before**: Used static `recipes` array with client-side filtering
- **After**: Fetches individual recipe from backend API using `recipesService.getRecipeById()`
- **Changes**:
  - Removed `author` field (not in database schema)
  - Removed `ingredients` section (not in current schema)
  - Instructions parsed from TEXT field to array
  - Loading and error states added

#### c. Recipe Carousel Component (`/components/recipe-carousel.tsx`)
- **Before**: Used static `featuredRecipes` array from `@/lib/mock-data`
- **After**: Fetches and displays first 5 recipes from API
- **Features**:
  - Loading state
  - Auto-hides when no recipes available
  - Maintains carousel functionality

### 2. Backend Updates

#### a. Recipe API Enhancement (`/backend/public/api/recipes.php`)
- **Added**: Support for fetching single recipe by ID
  - `GET /api/recipes.php?id=1` returns single recipe object
  - `GET /api/recipes.php` returns array of recipes
- **Response Format**:
  - Single recipe: Returns recipe object directly
  - Multiple recipes: Returns `{items: Recipe[], count: number}`
  - 404 error when recipe not found by ID

#### b. Type Definitions (`/frontend/lib/api/recipes.service.ts`)
- **Updated**: `Recipe` interface to match actual API response structure
- **Changes**:
  - Added nested objects for `cuisine`, `dietary`, `difficulty`, `rating`
  - Changed from flat properties to structured objects
  - Added null safety for optional fields

### 3. Database Seeding

#### a. Seed Script (`/backend/seed_recipes.sql`)
- **Purpose**: Populate database with sample recipes
- **Contains**:
  - 10 additional recipes (12 total including initial 2)
  - Sample ratings for each recipe
  - Variety of cuisines, difficulties, and dietary options

## Setup Instructions

### 1. Database Setup

Run the seed script to populate the database with sample recipes:

```bash
cd backend
mysql -u your_username -p cooking_app < seed_recipes.sql
```

Or using the mysql command line:

```sql
source /path/to/seed_recipes.sql;
```

### 2. Verify Database

Check that recipes were added:

```sql
USE cooking_app;
SELECT COUNT(*) FROM recipe;
SELECT recipe_id, recipe_title, cuisine_type_id, dietary_id, difficulty_id FROM recipe;
```

### 3. Start Backend Server

Make sure your PHP backend is running and accessible at the configured API endpoint.

### 4. Configure Frontend API URL

Check `frontend/lib/config.ts` to ensure the API URL is correctly configured:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  // ...
}
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
# or
bun dev
```

## API Endpoints Used

### Get All Recipes
- **Endpoint**: `GET /api/recipes.php`
- **Optional Filters**:
  - `cuisine_type_id`: Filter by cuisine
  - `dietary_id`: Filter by dietary preference
  - `difficulty_id`: Filter by difficulty level
- **Response**: `{items: Recipe[], count: number}`

### Get Single Recipe
- **Endpoint**: `GET /api/recipes.php?id={recipe_id}`
- **Response**: `Recipe` object or 404 error

### Get Lookups
- **Endpoint**: `GET /api/lookups.php`
- **Response**: `{cuisines: [], dietaries: [], difficulties: [], subjects: []}`

## Data Structure

### Recipe Object Structure

```typescript
{
  recipe_id: number
  recipe_title: string
  description: string | null
  image_url: string | null
  prep_time: number
  cook_time: number
  servings: number
  instructions: string | null
  cuisine: {
    cuisine_type_id: number
    cuisine_name: string
  } | null
  dietary: {
    dietary_id: number
    dietary_name: string
  } | null
  difficulty: {
    difficulty_id: number
    difficulty_level: string
  } | null
  rating: {
    average_rating: number
    rating_count: number
  }
}
```

## Future Enhancements

### Potential Database Schema Updates

1. **Add Ingredients Table**
   - Create `recipe_ingredients` junction table
   - Link recipes to ingredients with quantities

2. **Add Author/Creator Field**
   - Add `created_by` field to recipe table
   - Link to user table for attribution

3. **Add Categories/Tags**
   - Create tags table for more flexible categorization
   - Many-to-many relationship with recipes

4. **Add Recipe Images**
   - Store multiple images per recipe
   - Support for step-by-step images

## Troubleshooting

### No Recipes Showing
1. Check that backend is running
2. Verify database has recipes: `SELECT COUNT(*) FROM recipe;`
3. Check browser console for API errors
4. Verify API URL in frontend config

### Recipe Images Not Loading
1. Ensure image files exist in `frontend/public/`
2. Check `image_url` values in database
3. Verify Next.js image optimization settings

### Filters Not Working
1. Check that lookups API is returning data
2. Verify foreign key relationships in database
3. Check browser console for JavaScript errors

## Testing

### Manual Testing Checklist

- [ ] Recipe list page loads and displays recipes
- [ ] Search functionality works
- [ ] Filter by cuisine works
- [ ] Filter by dietary preference works
- [ ] Filter by difficulty works
- [ ] Clear filters button works
- [ ] Recipe detail page loads
- [ ] Recipe detail shows all information
- [ ] Recipe carousel on home page displays recipes
- [ ] Carousel navigation works
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Rating display shows correctly

## Notes

- Mock data is still available in `@/lib/mock-data` but is no longer used by recipe pages
- The migration maintains backward compatibility - if API fails, error messages guide users
- Instructions are stored as TEXT with newline-separated steps
- Ingredients feature is not yet implemented (requires schema update)


