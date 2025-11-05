"use client"

import { authService, setAuthToken, removeAuthToken, getAuthToken } from './api'
import type { ApiError } from './api-client'

export interface User {
  id: number
  email: string
  name: string
  firstName: string
  lastName: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  failedAttempts: number
  lockoutUntil: number | null
  rememberMe: boolean
  lastActivity: number
}

const AUTH_STORAGE_KEY = "foodfusion_auth"
const USER_STORAGE_KEY = "foodfusion_user"
const LOCKOUT_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds
const MAX_FAILED_ATTEMPTS = 3
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes of inactivity
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
      rememberMe: false,
      lastActivity: Date.now(),
    }
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) {
    // Check if token exists (legacy or refresh scenario)
    const token = getAuthToken()
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        return {
          user,
          isAuthenticated: true,
          failedAttempts: 0,
          lockoutUntil: null,
          rememberMe: false,
          lastActivity: Date.now(),
        }
      } catch {
        // Invalid user data, clear everything
        removeAuthToken()
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
      rememberMe: false,
      lastActivity: Date.now(),
    }
  }

  try {
    const state = JSON.parse(stored)
    
    // Check if session has expired
    if (state.isAuthenticated && !state.rememberMe) {
      const timeSinceLastActivity = Date.now() - state.lastActivity
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session expired, clear everything
        removeAuthToken()
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
        return {
          user: null,
          isAuthenticated: false,
          failedAttempts: 0,
          lockoutUntil: null,
          rememberMe: false,
          lastActivity: Date.now(),
        }
      }
    }
    
    return state
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
      rememberMe: false,
      lastActivity: Date.now(),
    }
  }
}

export function setAuthState(state: AuthState) {
  if (typeof window === "undefined") return
  
  // Update last activity timestamp
  const stateWithActivity = {
    ...state,
    lastActivity: Date.now(),
  }
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stateWithActivity))
  
  // Also store user separately for easier access
  if (state.user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function updateActivity() {
  const state = getAuthState()
  if (state.isAuthenticated) {
    setAuthState(state)
  }
}

export function isAccountLocked(): boolean {
  const state = getAuthState()
  if (!state.lockoutUntil) return false

  const now = Date.now()
  if (now < state.lockoutUntil) {
    return true
  }

  setAuthState({
    ...state,
    failedAttempts: 0,
    lockoutUntil: null,
    lastActivity: Date.now(),
  })
  return false
}

export function getRemainingLockoutTime(): number {
  const state = getAuthState()
  if (!state.lockoutUntil) return 0

  const remaining = state.lockoutUntil - Date.now()
  return remaining > 0 ? remaining : 0
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; message: string; user?: User }> {
  // Check if account is locked
  if (isAccountLocked()) {
    const remainingMs = getRemainingLockoutTime()
    const remainingMinutes = Math.ceil(remainingMs / 60000)
    return {
      success: false,
      message: `Account locked. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`,
    }
  }

  const state = getAuthState()

  try {
    // Call backend API
    const response = await authService.login({ email, password })

    if (response.data) {
      const { token, user: apiUser } = response.data

      // Transform backend user to frontend user format
      const user: User = {
        id: apiUser.user_id,
        email: apiUser.email,
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
      }

      // Store token
      setAuthToken(token)

      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
        failedAttempts: 0,
        lockoutUntil: null,
        rememberMe,
        lastActivity: Date.now(),
      })

      return { success: true, message: response.message || "Login successful!", user }
    }

    // Should not reach here, but handle just in case
    throw new Error("Invalid response from server")
  } catch (error) {
    // Failed login
    const apiError = error as ApiError
    const newFailedAttempts = state.failedAttempts + 1
    const shouldLockout = newFailedAttempts >= MAX_FAILED_ATTEMPTS

    setAuthState({
      ...state,
      failedAttempts: newFailedAttempts,
      lockoutUntil: shouldLockout ? Date.now() + LOCKOUT_DURATION : null,
      lastActivity: Date.now(),
    })

    if (shouldLockout) {
      return {
        success: false,
        message: `Too many failed attempts. Account locked for 3 minutes.`,
      }
    }

    const attemptsRemaining = MAX_FAILED_ATTEMPTS - newFailedAttempts
    const errorMessage = apiError.message || "Invalid credentials"
    
    return {
      success: false,
      message: `${errorMessage}. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? "s" : ""} remaining.`,
    }
  }
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // Call backend API
    const response = await authService.register({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })

    if (response.data) {
      const { user_id, email: userEmail } = response.data

      // After registration, automatically log in with remember me enabled
      const loginResult = await login(email, password, true)
      
      if (loginResult.success) {
        return {
          success: true,
          message: response.message || "Registration successful! Welcome to FoodFusion!",
          user: loginResult.user,
        }
      }

      // If auto-login fails, still return success but ask user to login
      return {
        success: true,
        message: "Registration successful! Please login to continue.",
      }
    }

    throw new Error("Invalid response from server")
  } catch (error) {
    const apiError = error as ApiError
    return {
      success: false,
      message: apiError.message || "Registration failed. Please try again.",
    }
  }
}

export async function logout(): Promise<void> {
  try {
    // Call backend API to revoke token
    await authService.logout()
  } catch (error) {
    // Continue with logout even if API call fails
    console.error("Logout API call failed:", error)
  } finally {
    // Clear local storage
    removeAuthToken()
    setAuthState({
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
      rememberMe: false,
      lastActivity: Date.now(),
    })
  }
}
