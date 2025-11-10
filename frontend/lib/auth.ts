"use client"

import { authService, setCsrfToken, removeCsrfToken } from './api-client'
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
}

const AUTH_STORAGE_KEY = "foodfusion_auth"
const LOCKOUT_DURATION = 3 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 3

export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
    }
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
    }
  }

  try {
    const state = JSON.parse(stored)
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: state.failedAttempts || 0,
      lockoutUntil: state.lockoutUntil || null,
    }
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
    }
  }
}

export function setAuthState(state: Partial<AuthState>) {
  if (typeof window === "undefined") return
  
  const currentState = getAuthState()
  const newState = {
    failedAttempts: state.failedAttempts ?? currentState.failedAttempts,
    lockoutUntil: state.lockoutUntil ?? currentState.lockoutUntil,
  }
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))
}

export function isAccountLocked(): boolean {
  const state = getAuthState()
  if (!state.lockoutUntil) return false

  const now = Date.now()
  if (now < state.lockoutUntil) {
    return true
  }

  setAuthState({
    failedAttempts: 0,
    lockoutUntil: null,
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
    const response = await authService.login({ email, password, remember_me: rememberMe })

    if (response.data) {
      const { csrf_token, user: apiUser } = response.data

      const user: User = {
        id: apiUser.user_id,
        email: apiUser.email,
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
      }

      setCsrfToken(csrf_token)

      setAuthState({
        failedAttempts: 0,
        lockoutUntil: null,
      })

      return { success: true, message: response.message || "Login successful!", user }
    }

    throw new Error("Invalid response from server")
  } catch (error) {
    const apiError = error as ApiError
    const newFailedAttempts = state.failedAttempts + 1
    const shouldLockout = newFailedAttempts >= MAX_FAILED_ATTEMPTS

    setAuthState({
      failedAttempts: newFailedAttempts,
      lockoutUntil: shouldLockout ? Date.now() + LOCKOUT_DURATION : null,
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
    const response = await authService.register({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })

    if (response.data) {
      const { user_id, email: userEmail, csrf_token } = response.data

      if (csrf_token) {
        setCsrfToken(csrf_token)
      }

      const user: User = {
        id: user_id,
        email: userEmail,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
      }

      return {
        success: true,
        message: response.message || "Registration successful! Welcome to FoodFusion!",
        user,
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
    await authService.logout()
  } catch (error) {
    console.error("Logout API call failed:", error)
  } finally {
    removeCsrfToken()
    
    setAuthState({
      failedAttempts: 0,
      lockoutUntil: null,
    })
  }
}

export async function checkAuth(): Promise<User | null> {
  try {
    const response = await authService.checkAuth()
    
    if (response.data && response.data.user) {
      const apiUser = response.data.user
      
      if (response.data.csrf_token) {
        setCsrfToken(response.data.csrf_token)
      }

      return {
        id: apiUser.user_id,
        email: apiUser.email,
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}
