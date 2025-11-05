/**
 * EXAMPLE USAGE: How to Use API Services in Your Components
 * 
 * This file demonstrates various patterns for using the API services
 * with the PHP backend. Copy these examples into your actual components.
 * 
 * DO NOT import this file directly - it's for reference only!
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  recipesService,
  cookbookService,
  lookupsService,
  contactService,
  resourcesService,
  type Recipe,
  type CookbookRecipe,
  type Resource,
  type Cuisine,
  type ApiError,
} from '@/lib/api'

// ============================================================================
// EXAMPLE 1: Fetching Public Recipes
// ============================================================================

export function RecipesListExample() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all recipes
        const response = await recipesService.getRecipes()

        if (response.data) {
          setRecipes(response.data.items)
        }
      } catch (err) {
        const apiError = err as ApiError
        setError(apiError.message || 'Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  if (loading) return <div>Loading recipes...</div>
  if (error) return <div>Error: {error}</div>
  if (recipes.length === 0) return <div>No recipes found</div>

  return (
    <div>
      <h1>Recipes</h1>
      {recipes.map((recipe) => (
        <div key={recipe.recipe_id}>
          <h2>{recipe.recipe_title}</h2>
          <p>{recipe.description}</p>
          <p>Cuisine: {recipe.cuisine_name}</p>
          <p>Difficulty: {recipe.difficulty_level}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Filtered Recipes with Lookup Data
// ============================================================================

export function FilteredRecipesExample() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)

  // Load cuisines on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const response = await lookupsService.getLookups()
        if (response.data) {
          setCuisines(response.data.cuisines)
        }
      } catch (err) {
        console.error('Failed to load cuisines:', err)
      }
    }
    loadLookups()
  }, [])

  // Load recipes when filter changes
  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true)

        const response = await recipesService.getRecipes({
          cuisine_type_id: selectedCuisine,
        })

        if (response.data) {
          setRecipes(response.data.items)
        }
      } catch (err) {
        console.error('Failed to load recipes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [selectedCuisine])

  return (
    <div>
      <h1>Filter Recipes by Cuisine</h1>
      
      {/* Filter dropdown */}
      <select 
        value={selectedCuisine || ''} 
        onChange={(e) => setSelectedCuisine(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">All Cuisines</option>
        {cuisines.map((cuisine) => (
          <option key={cuisine.cuisine_type_id} value={cuisine.cuisine_type_id}>
            {cuisine.cuisine_name}
          </option>
        ))}
      </select>

      {/* Results */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {recipes.map((recipe) => (
            <div key={recipe.recipe_id}>{recipe.recipe_title}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Authentication Flow
// ============================================================================

export function LoginExample() {
  const { login, user, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        console.log('Logged in successfully as:', user?.name)
        // Redirect to dashboard or home page
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <div>Welcome back, {user?.firstName}!</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

// ============================================================================
// EXAMPLE 4: Create Cookbook Recipe (Authenticated)
// ============================================================================

export function CreateRecipeExample() {
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    recipe_title: '',
    description: '',
    cuisine_type_id: 1,
    dietary_id: 1,
    difficulty_id: 1,
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    instructions: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const response = await cookbookService.createRecipe(formData)

      if (response.data) {
        setSuccess(true)
        console.log('Recipe created with ID:', response.data.post_id)
        
        // Reset form
        setFormData({
          recipe_title: '',
          description: '',
          cuisine_type_id: 1,
          dietary_id: 1,
          difficulty_id: 1,
          prep_time: 0,
          cook_time: 0,
          servings: 1,
          instructions: '',
        })
      }
    } catch (err) {
      const apiError = err as ApiError
      
      if (apiError.status === 401) {
        setError('You must be logged in to create a recipe')
      } else {
        setError(apiError.message || 'Failed to create recipe')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Please log in to create recipes</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Recipe</h1>

      {success && <div style={{ color: 'green' }}>Recipe created successfully!</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>Recipe Title:</label>
        <input
          type="text"
          value={formData.recipe_title}
          onChange={(e) => setFormData({ ...formData, recipe_title: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Description:</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Prep Time (minutes):</label>
        <input
          type="number"
          value={formData.prep_time}
          onChange={(e) => setFormData({ ...formData, prep_time: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Cook Time (minutes):</label>
        <input
          type="number"
          value={formData.cook_time}
          onChange={(e) => setFormData({ ...formData, cook_time: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Servings:</label>
        <input
          type="number"
          value={formData.servings}
          onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
          min="1"
        />
      </div>

      <div>
        <label>Instructions:</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          rows={10}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Recipe'}
      </button>
    </form>
  )
}

// ============================================================================
// EXAMPLE 5: User's Cookbook with CRUD Operations
// ============================================================================

export function MyCookbookExample() {
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState<CookbookRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user's recipes
  useEffect(() => {
    if (!isAuthenticated) return

    async function loadRecipes() {
      try {
        setLoading(true)
        const response = await cookbookService.getCookbookRecipes()

        if (response.data) {
          setRecipes(response.data.items)
        }
      } catch (err) {
        const apiError = err as ApiError
        setError(apiError.message || 'Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [isAuthenticated])

  // Delete recipe
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      await cookbookService.deleteRecipe(id)
      
      // Remove from state
      setRecipes(recipes.filter((r) => r.post_id !== id))
      console.log('Recipe deleted successfully')
    } catch (err) {
      const apiError = err as ApiError
      alert('Failed to delete recipe: ' + apiError.message)
    }
  }

  // Toggle like
  const handleLike = async (id: number) => {
    try {
      const response = await cookbookService.toggleLike(id)
      
      if (response.data) {
        // Update state with new like status
        setRecipes(recipes.map((r) => 
          r.post_id === id 
            ? { ...r, is_liked: response.data.liked, likes_count: response.data.likes_count }
            : r
        ))
      }
    } catch (err) {
      const apiError = err as ApiError
      alert('Failed to like recipe: ' + apiError.message)
    }
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your cookbook</div>
  }

  if (loading) return <div>Loading your recipes...</div>
  if (error) return <div>Error: {error}</div>
  if (recipes.length === 0) return <div>You haven't created any recipes yet</div>

  return (
    <div>
      <h1>My Cookbook</h1>
      
      {recipes.map((recipe) => (
        <div key={recipe.post_id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <h2>{recipe.recipe_title}</h2>
          <p>{recipe.description}</p>
          <p>Prep: {recipe.prep_time}min | Cook: {recipe.cook_time}min | Serves: {recipe.servings}</p>
          
          <div>
            <button onClick={() => handleLike(recipe.post_id)}>
              {recipe.is_liked ? '❤️' : '🤍'} {recipe.likes_count || 0}
            </button>
            <button onClick={() => handleDelete(recipe.post_id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Contact Form
// ============================================================================

export function ContactFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject_id: 1,
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      await contactService.sendMessage(formData)
      
      setSuccess(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject_id: 1,
        message: '',
      })
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Contact Us</h1>

      {success && <div style={{ color: 'green' }}>Message sent successfully!</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Subject:</label>
        <select
          value={formData.subject_id}
          onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
        >
          <option value="1">General Inquiry</option>
          <option value="2">Recipe Question</option>
          <option value="3">Technical Support</option>
          <option value="4">Feedback</option>
        </select>
      </div>

      <div>
        <label>Message:</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={5}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

// ============================================================================
// EXAMPLE 7: Resources with Download Links
// ============================================================================

export function ResourcesExample() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState<'Culinary' | 'Educational' | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true)
        
        const response = await resourcesService.getResources(
          filter ? { type: filter } : undefined
        )

        if (response.data) {
          setResources(response.data.items)
        }
      } catch (err) {
        console.error('Failed to load resources:', err)
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [filter])

  return (
    <div>
      <h1>Educational Resources</h1>

      {/* Filter buttons */}
      <div>
        <button onClick={() => setFilter(undefined)}>All</button>
        <button onClick={() => setFilter('Culinary')}>Culinary</button>
        <button onClick={() => setFilter('Educational')}>Educational</button>
      </div>

      {/* Resources list */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {resources.map((resource) => (
            <div key={resource.resource_id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
              <p><em>{resource.resource_type}</em></p>
              
              {resource.file_url && (
                <a 
                  href={resourcesService.getDownloadUrl(resource.file_url)} 
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF
                </a>
              )}
              
              {resource.external_url && (
                <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                  Visit Resource
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 8: Advanced Error Handling
// ============================================================================

export function AdvancedErrorHandlingExample() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{
    message: string
    type: 'network' | 'timeout' | 'auth' | 'server' | 'unknown'
  } | null>(null)

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true)
        setError(null)

        const response = await recipesService.getRecipes()

        if (response.data) {
          setRecipes(response.data.items)
        }
      } catch (err) {
        const apiError = err as ApiError

        // Categorize error types
        let errorType: 'network' | 'timeout' | 'auth' | 'server' | 'unknown' = 'unknown'
        
        if (apiError.status === 0) {
          errorType = 'network'
        } else if (apiError.status === 408) {
          errorType = 'timeout'
        } else if (apiError.status === 401 || apiError.status === 403) {
          errorType = 'auth'
        } else if (apiError.status >= 500) {
          errorType = 'server'
        }

        setError({
          message: apiError.message,
          type: errorType,
        })

        // Log to error tracking service (e.g., Sentry)
        console.error('API Error:', {
          endpoint: 'recipes',
          status: apiError.status,
          message: apiError.message,
          type: errorType,
        })
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()
  }, [])

  if (loading) return <div>Loading...</div>

  if (error) {
    return (
      <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>
        <h3>Error: {error.type}</h3>
        <p>{error.message}</p>
        
        {error.type === 'network' && (
          <p>Please check your internet connection and try again.</p>
        )}
        
        {error.type === 'timeout' && (
          <p>Request took too long. Please try again.</p>
        )}
        
        {error.type === 'auth' && (
          <p>Please log in to continue.</p>
        )}
        
        {error.type === 'server' && (
          <p>Server error. Please try again later.</p>
        )}
        
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {recipes.map((recipe) => (
        <div key={recipe.recipe_id}>{recipe.recipe_title}</div>
      ))}
    </div>
  )
}

/**
 * TIPS FOR USING THESE EXAMPLES:
 * 
 * 1. Copy the relevant example into your component file
 * 2. Adjust styling to match your UI library (e.g., shadcn/ui)
 * 3. Add proper loading states and error boundaries
 * 4. Implement optimistic updates for better UX
 * 5. Use React Query or SWR for advanced caching
 * 6. Add proper TypeScript types from '@/lib/api'
 * 7. Implement proper error tracking (e.g., Sentry)
 * 8. Add analytics tracking for user actions
 */

