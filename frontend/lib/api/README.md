# API Services Quick Reference

This directory contains all API service modules for communicating with the PHP backend.

## 📁 Structure

```
api/
├── index.ts              # Main export file
├── auth.service.ts       # Authentication & user management
├── recipes.service.ts    # Public recipes
├── cookbook.service.ts   # User cookbook (requires auth)
├── resources.service.ts  # Educational resources
├── lookups.service.ts    # Lookup data (cuisines, dietaries, etc.)
└── contact.service.ts    # Contact form
```

## 🚀 Quick Start

### Import Services

```typescript
// Import individual services
import { authService, recipesService, cookbookService } from '@/lib/api'

// Or import specific types
import type { Recipe, LoginRequest, ApiResponse } from '@/lib/api'
```

## 📖 Service Reference

### Authentication Service (`auth.service.ts`)

```typescript
// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Register
const response = await authService.register({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'password123'
})

// Logout
await authService.logout()

// Forgot Password
await authService.forgotPassword({
  email: 'user@example.com',
  new_password: 'newpassword123'
})
```

### Recipes Service (`recipes.service.ts`)

```typescript
// Get all recipes
const response = await recipesService.getRecipes()

// Get filtered recipes
const response = await recipesService.getRecipes({
  cuisine_type_id: 1,
  dietary_id: 2,
  difficulty_id: 1
})

// Get single recipe
const response = await recipesService.getRecipeById(1)

// Rate a recipe
const response = await recipesService.rateRecipe({
  recipe_id: 1,
  rating: 5,
  comment: 'Delicious!'
})
```

### Cookbook Service (`cookbook.service.ts`) 🔒

**Note**: Requires authentication

```typescript
// Get user's recipes
const response = await cookbookService.getCookbookRecipes()

// Get single recipe
const response = await cookbookService.getCookbookRecipeById(1)

// Create recipe
const response = await cookbookService.createRecipe({
  recipe_title: 'My Recipe',
  description: 'Description here',
  cuisine_type_id: 1,
  dietary_id: 1,
  difficulty_id: 2,
  prep_time: 15,
  cook_time: 30,
  servings: 4,
  instructions: 'Step by step instructions',
  image_url: 'https://example.com/image.jpg'
})

// Update recipe
const response = await cookbookService.updateRecipe(1, {
  recipe_title: 'Updated Title',
  servings: 6
})

// Delete recipe
await cookbookService.deleteRecipe(1)

// Toggle like
const response = await cookbookService.toggleLike(1)
```

### Resources Service (`resources.service.ts`)

```typescript
// Get all resources
const response = await resourcesService.getResources()

// Get filtered resources
const response = await resourcesService.getResources({
  type: 'Culinary' // or 'Educational'
})

// Get single resource
const response = await resourcesService.getResourceById(1)

// Get download URL
const url = resourcesService.getDownloadUrl('/public/downloads/file.pdf')
```

### Lookups Service (`lookups.service.ts`)

```typescript
// Get all lookup data (cuisines, dietaries, difficulties, subjects)
const response = await lookupsService.getLookups()

// Access data
const { cuisines, dietaries, difficulties, subjects } = response.data

// Get contact subjects only
const response = await lookupsService.getSubjects()
```

### Contact Service (`contact.service.ts`)

```typescript
// Send message with subject_id
await contactService.sendMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject_id: 1,
  message: 'Hello, I have a question...'
})

// Send message with subject text
await contactService.sendMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'General Inquiry',
  message: 'Hello, I have a question...'
})
```

## 🔐 Authentication

### Token Management

Token is automatically managed by the API client. No need to manually add it to requests.

```typescript
import { setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api'

// Get current token
const token = getAuthToken()

// Set token (usually done automatically after login)
setAuthToken('your-token-here')

// Remove token (done automatically on logout)
removeAuthToken()
```

### Protected Routes

Services that require authentication:
- `cookbookService` - All methods

The API client automatically includes the token in requests if available.

## 🎯 Error Handling

All services throw `ApiError` on failure:

```typescript
import type { ApiError } from '@/lib/api'

try {
  const response = await recipesService.getRecipes()
  // Handle success
} catch (error) {
  const apiError = error as ApiError
  
  console.error('Status:', apiError.status)
  console.error('Message:', apiError.message)
  console.error('Error:', apiError.error)
  
  // Handle specific errors
  if (apiError.status === 401) {
    // Unauthorized - redirect to login
  } else if (apiError.status === 404) {
    // Not found
  } else if (apiError.status === 408) {
    // Timeout
  }
}
```

## 📝 Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  message: string
  data?: T
}
```

### Error Response

```typescript
interface ApiError {
  message: string
  status: number
  error?: string
}
```

## 🔄 Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<Recipe[]>([])

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true)
      const response = await recipesService.getRecipes()
      setData(response.data?.items || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  loadData()
}, [])
```

### Form Submission

```typescript
const handleSubmit = async (formData: any) => {
  try {
    const response = await cookbookService.createRecipe(formData)
    console.log('Success:', response.message)
    // Redirect or show success message
  } catch (error: any) {
    console.error('Error:', error.message)
    // Show error message
  }
}
```

### Conditional Rendering

```typescript
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error} />
if (!data.length) return <EmptyState />

return <DataDisplay data={data} />
```

## 🛠️ TypeScript Types

All services include TypeScript types for requests and responses. Import them as needed:

```typescript
import type {
  // Auth types
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  
  // Recipe types
  Recipe,
  RecipesResponse,
  RecipeFilters,
  
  // Cookbook types
  CookbookRecipe,
  CreateCookbookRecipeRequest,
  
  // Resource types
  Resource,
  ResourcesResponse,
  
  // Lookup types
  Cuisine,
  Dietary,
  Difficulty,
  Subject,
  
  // Common types
  ApiResponse,
  ApiError,
} from '@/lib/api'
```

## ⚡ Performance Tips

1. **Cache lookup data**: Cuisines, dietaries, and difficulties rarely change
2. **Debounce search**: Wait for user to stop typing before searching
3. **Paginate results**: Request only needed data
4. **Memoize expensive computations**: Use `useMemo` for filtered/sorted data
5. **Implement optimistic updates**: Update UI before API confirms

## 🔗 Related Files

- `../config.ts` - API configuration
- `../api-client.ts` - HTTP client implementation
- `../auth.ts` - Auth utilities and state management
- `../../contexts/auth-context.tsx` - Auth React context

## 📚 Additional Resources

- [Integration Guide](../../../INTEGRATION_GUIDE.md)
- [Backend API Documentation](../../../backend/README_API.md)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**Happy coding! 🚀**

