# Featured Recipes Implementation

## Overview
Featured recipes automatically display the top 5 highest-rated recipes on the home page carousel.

## Changes Made

### 1. Backend API Enhancement (`/backend/public/api/recipes.php`)

#### New Feature: Featured Recipes Endpoint
```
GET /api/recipes.php?featured=1
```

**Returns:** Top 5 recipes sorted by:
1. Average rating (highest first)
2. Rating count (tie-breaker)

#### Database Query Optimization
- **Before**: Separate query for each recipe's ratings (N+1 query problem)
- **After**: Single aggregated query with JOIN
- **Performance**: Much faster, especially with many recipes

#### SQL Changes:
```sql
-- Added to SELECT clause
COALESCE(AVG(rr.rating), 0) as avg_rating,
COUNT(rr.rating_id) as rating_count

-- Added JOIN
LEFT JOIN recipe_ratings rr ON r.recipe_id = rr.recipe_id

-- Added GROUP BY
GROUP BY r.recipe_id, ...

-- Dynamic ORDER BY
ORDER BY avg_rating DESC, rating_count DESC  -- For featured
ORDER BY r.created_at DESC                    -- For regular list
```

### 2. Frontend Service (`/frontend/lib/api/recipes.service.ts`)

#### New Method: `getFeaturedRecipes()`
```typescript
async getFeaturedRecipes(): Promise<ApiResponse<RecipesResponse>> {
  return apiClient.get<RecipesResponse>(API_CONFIG.endpoints.recipes, { featured: 1 })
}
```

#### Updated Interface:
```typescript
export interface RecipeFilters {
  cuisine_type_id?: number
  dietary_id?: number
  difficulty_id?: number
  featured?: number  // ← Added
}
```

### 3. Recipe Carousel Component (`/components/recipe-carousel.tsx`)

#### Updated to Use Featured Recipes
- **Before**: `recipesService.getRecipes()` → Takes first 5
- **After**: `recipesService.getFeaturedRecipes()` → Gets top 5 by rating

```typescript
const response = await recipesService.getFeaturedRecipes()
// Returns exactly 5 recipes, already sorted by rating
```

## How It Works

### Rating Calculation
1. **Average Rating**: Mean of all ratings (1-5 stars)
2. **Rating Count**: Total number of ratings
3. **Sorting Priority**:
   - Primary: Highest average rating
   - Secondary: Most ratings (if same average)

### Example Scenarios

**Scenario 1: Clear Winner**
- Pizza: 4.8 avg (50 ratings) → Featured #1
- Curry: 4.5 avg (30 ratings) → Featured #2
- Pasta: 4.2 avg (100 ratings) → Featured #3

**Scenario 2: Tie-Breaker**
- Pizza: 4.5 avg (100 ratings) → Featured #1
- Curry: 4.5 avg (50 ratings) → Featured #2
- Both have 4.5 avg, but Pizza has more ratings

**Scenario 3: New Recipe**
- New recipe with 0 ratings → Shows at bottom
- Recipes with ratings always rank higher

## Data Flow

```
User visits home page
       ↓
RecipeCarousel component mounts
       ↓
Calls getFeaturedRecipes()
       ↓
Backend: GET /api/recipes.php?featured=1
       ↓
SQL aggregates ratings and sorts by avg_rating DESC
       ↓
Returns top 5 recipes
       ↓
Frontend displays in carousel
```

## API Response Format

```json
{
  "success": true,
  "message": "Recipes retrieved successfully",
  "data": {
    "items": [
      {
        "recipe_id": 3,
        "recipe_title": "Chocolate Lava Cake",
        "rating": {
          "average_rating": 4.9,
          "rating_count": 312
        },
        ...
      },
      ...
    ],
    "count": 5
  }
}
```

## Database Requirements

### Tables Used:
- `recipe`: Main recipe data
- `recipe_ratings`: Individual ratings (1-5 stars)
- `cuisine_type`, `dietary`, `difficulty`: Lookup tables

### Rating Aggregation:
```sql
AVG(rr.rating) as avg_rating
COUNT(rr.rating_id) as rating_count
```

## Performance Optimization

### Query Efficiency:
- **Before**: 1 main query + N rating queries (1 per recipe)
  - For 12 recipes: 13 database queries
- **After**: 1 aggregated query with JOIN
  - For any number of recipes: 1 database query

### Benefits:
- ✅ 92% reduction in database queries
- ✅ Faster page load times
- ✅ Better database performance
- ✅ Scales better with more recipes

## Testing

### Test Featured Recipe Display:

1. **Add ratings to recipes:**
   ```sql
   -- Add high ratings to make a recipe featured
   INSERT INTO recipe_ratings (recipe_id, rating) VALUES
   (3, 5), (3, 5), (3, 5), (3, 4), (3, 5);
   ```

2. **Verify top recipes:**
   ```sql
   SELECT 
     r.recipe_id,
     r.recipe_title,
     COALESCE(AVG(rr.rating), 0) as avg_rating,
     COUNT(rr.rating_id) as rating_count
   FROM recipe r
   LEFT JOIN recipe_ratings rr ON r.recipe_id = rr.recipe_id
   GROUP BY r.recipe_id, r.recipe_title
   ORDER BY avg_rating DESC, rating_count DESC
   LIMIT 5;
   ```

3. **Check home page carousel:**
   - Should show top 5 rated recipes
   - Recipes with higher ratings appear first

### Test API Endpoint:

```bash
# Get featured recipes
curl http://localhost:8000/api/recipes.php?featured=1

# Should return exactly 5 recipes sorted by rating
```

### Test Frontend:

1. Go to home page
2. Check recipe carousel
3. Verify it shows top-rated recipes
4. Higher-rated recipes should appear in carousel

## Future Enhancements

### Potential Improvements:

1. **Trending Recipes**
   - Add `?trending=1` parameter
   - Sort by recent ratings (last 7 days)

2. **Featured by Category**
   - `?featured=1&cuisine_type_id=1`
   - Top rated Italian recipes

3. **Minimum Rating Threshold**
   - Only feature recipes with 4+ stars
   - Require minimum number of ratings (e.g., 5+)

4. **Time-based Weighting**
   - Recent ratings weighted more heavily
   - Decay older ratings

5. **Featured Recipe Cache**
   - Cache top recipes for performance
   - Update every hour or on new ratings

## Notes

- Featured recipes refresh on every page load
- Automatically updates as new ratings are added
- No manual curation needed
- Recipes with 0 ratings get 0.0 average (appears last)
- SQL uses `COALESCE(AVG(rr.rating), 0)` to handle recipes with no ratings

## Verification Checklist

- ✅ Backend API returns top 5 recipes by rating
- ✅ Frontend service has `getFeaturedRecipes()` method
- ✅ Recipe carousel uses featured recipes endpoint
- ✅ Carousel displays exactly 5 recipes
- ✅ Higher-rated recipes appear in carousel
- ✅ Performance optimized (single query)
- ✅ Works with recipes that have no ratings
- ✅ Properly handles ties in ratings

