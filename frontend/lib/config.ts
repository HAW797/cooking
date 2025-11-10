export const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || '') 
    : '',
  
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
  
  endpoints: {
    login: '/api/login.php',
    register: '/api/register.php',
    logout: '/api/logout.php',
    checkAuth: '/api/check_auth.php',
    forgotPassword: '/api/forgot_password.php',
    
    recipes: '/api/recipes.php',
    resources: '/api/resources.php',
    events: '/api/events.php',
    
    lookups: '/api/lookups.php',
    
    contact: '/api/contact.php',
    subjects: '/api/subjects.php',
    
    cookbook: '/api/cookbook.php',
    cookbookLike: '/api/cookbook_like.php',
    
    recipeRating: '/api/recipe_rating.php',
  },
  
  storageKeys: {
    authToken: 'foodfusion_auth_token',
    user: 'foodfusion_user',
  },
} as const

export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`
}

