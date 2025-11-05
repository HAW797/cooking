// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  
  // Request timeout in milliseconds
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
  
  // API endpoints
  endpoints: {
    // Authentication
    login: '/api/login.php',
    register: '/api/register.php',
    logout: '/api/logout.php',
    forgotPassword: '/api/forgot_password.php',
    
    // Recipes
    recipes: '/api/recipes.php',
    
    // Resources
    resources: '/api/resources.php',
    
    // Lookups (cuisines, dietaries, difficulties, subjects)
    lookups: '/api/lookups.php',
    
    // Contact
    contact: '/api/contact.php',
    subjects: '/api/subjects.php',
    
    // Cookbook (authenticated)
    cookbook: '/api/cookbook.php',
    cookbookLike: '/api/cookbook_like.php',
    
    // Recipe Rating
    recipeRating: '/api/recipe_rating.php',
  },
  
  // Storage keys
  storageKeys: {
    authToken: 'foodfusion_auth_token',
    user: 'foodfusion_user',
  },
} as const

// Helper to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`
}

