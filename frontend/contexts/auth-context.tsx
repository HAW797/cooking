"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, getAuthState, login as authLogin, register as authRegister, logout as authLogout, isAccountLocked, getRemainingLockoutTime as getAuthLockoutTime, checkAuth } from "@/lib/auth"
import { z } from "zod"

// Validation schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
})

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .refine((val) => val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character",
    }),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
})

type LoginInput = z.infer<typeof loginSchema>
type RegisterInput = z.infer<typeof registerSchema>

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; errors?: Record<string, string>; attemptsRemaining?: number; isLocked?: boolean }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; message: string; errors?: Record<string, string> }>
  logout: () => Promise<void>
  loading: boolean
  lockoutUntil: number | null
  getRemainingLockoutTime: () => number
}

const  AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = getAuthState()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(initialState.lockoutUntil)

  // Check authentication status on mount (validates session cookie)
  useEffect(() => {
    const validateSession = async () => {
      try {
        const authenticatedUser = await checkAuth()
        if (authenticatedUser) {
          setUser(authenticatedUser)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  // Update lockout state from localStorage
  useEffect(() => {
    const state = getAuthState()
    if (state.lockoutUntil !== lockoutUntil) {
      setLockoutUntil(state.lockoutUntil)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Check if account is locked
    if (isAccountLocked()) {
      const remainingMs = getAuthLockoutTime()
      return { 
        success: false, 
        message: 'Your account is locked', 
        isLocked: true,
        attemptsRemaining: 0
      }
    }

    // Validate input
    const validation = loginSchema.safeParse({ email, password })
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string
        errors[field] = err.message
      })
      return { success: false, message: 'Please fix the errors below', errors }
    }

    try {
      const result = await authLogin(email, password)
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
        setLockoutUntil(null)
        return result
      }
      
      // Parse attempts remaining from message
      const state = getAuthState()
      const attemptsMatch = result.message.match(/(\d+)\s+attempt/)
      const attemptsRemaining = attemptsMatch ? parseInt(attemptsMatch[1]) : 0
      const isLocked = result.message.includes('locked')
      
      if (isLocked) {
        setLockoutUntil(state.lockoutUntil)
      }
      
      return {
        ...result,
        attemptsRemaining,
        isLocked,
        errors: { password: result.message }
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const getRemainingLockoutTime = () => {
    return getAuthLockoutTime()
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // Validate input
    const validation = registerSchema.safeParse({ email, password, firstName, lastName })
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string
        errors[field] = err.message
      })
      return { success: false, message: 'Please fix the errors below', errors }
    }

    try {
      const result = await authRegister(email, password, firstName, lastName)
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
      }
      return result
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    await authLogout()
    setUser(null)
    setIsAuthenticated(false)
    setLockoutUntil(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading, lockoutUntil, getRemainingLockoutTime }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
