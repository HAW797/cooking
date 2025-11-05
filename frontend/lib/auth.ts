"use client"

export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  failedAttempts: number
  lockoutUntil: number | null
}

const AUTH_STORAGE_KEY = "foodfusion_auth"
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
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
    return JSON.parse(stored)
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      failedAttempts: 0,
      lockoutUntil: null,
    }
  }
}

export function setAuthState(state: AuthState) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
}

export function isAccountLocked(): boolean {
  const state = getAuthState()
  if (!state.lockoutUntil) return false

  const now = Date.now()
  if (now < state.lockoutUntil) {
    return true
  }

  // Lockout expired, reset failed attempts
  setAuthState({
    ...state,
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

export function login(email: string, password: string): { success: boolean; message: string; user?: User } {
  // Check if account is locked
  if (isAccountLocked()) {
    const remainingMs = getRemainingLockoutTime()
    const remainingMinutes = Math.ceil(remainingMs / 60000)
    return {
      success: false,
      message: `Account locked. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`,
    }
  }

  // Mock authentication - in production, this would validate against a database
  const validCredentials = [
    { email: "demo@foodfusion.com", password: "demo123", name: "Demo User", firstName: "Demo", lastName: "User" },
    { email: "chef@foodfusion.com", password: "chef123", name: "Chef Maria", firstName: "Chef", lastName: "Maria" },
  ]

  const validUser = validCredentials.find((cred) => cred.email === email && cred.password === password)

  const state = getAuthState()

  if (validUser) {
    // Successful login
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: validUser.email,
      name: validUser.name,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      createdAt: new Date().toISOString(),
    }

    setAuthState({
      user,
      isAuthenticated: true,
      failedAttempts: 0,
      lockoutUntil: null,
    })

    return { success: true, message: "Login successful!", user }
  } else {
    // Failed login
    const newFailedAttempts = state.failedAttempts + 1
    const shouldLockout = newFailedAttempts >= MAX_FAILED_ATTEMPTS

    setAuthState({
      ...state,
      failedAttempts: newFailedAttempts,
      lockoutUntil: shouldLockout ? Date.now() + LOCKOUT_DURATION : null,
    })

    if (shouldLockout) {
      return {
        success: false,
        message: `Too many failed attempts. Account locked for 15 minutes.`,
      }
    }

    const attemptsRemaining = MAX_FAILED_ATTEMPTS - newFailedAttempts
    return {
      success: false,
      message: `Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? "s" : ""} remaining.`,
    }
  }
}

export function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): { success: boolean; message: string; user?: User } {
  // Mock registration - in production, this would save to a database
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
  }

  setAuthState({
    user,
    isAuthenticated: true,
    failedAttempts: 0,
    lockoutUntil: null,
  })

  return { success: true, message: "Registration successful!", user }
}

export function logout() {
  setAuthState({
    user: null,
    isAuthenticated: false,
    failedAttempts: 0,
    lockoutUntil: null,
  })
}
