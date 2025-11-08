"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, getAuthState, login as authLogin, register as authRegister, logout as authLogout, updateActivity, isAccountLocked, getRemainingLockoutTime as getAuthLockoutTime } from "@/lib/auth"
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
  const [user, setUser] = useState<User | null>(initialState.user)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const [loading, setLoading] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(initialState.lockoutUntil)

  useEffect(() => {
    const state = getAuthState()
    if (state.user !== user || state.isAuthenticated !== isAuthenticated) {
      setUser(state.user)
      setIsAuthenticated(state.isAuthenticated)
    }
    if (state.lockoutUntil !== lockoutUntil) {
      setLockoutUntil(state.lockoutUntil)
    }

    if (state.isAuthenticated) {
      const handleActivity = () => updateActivity()
      
      window.addEventListener('mousemove', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('click', handleActivity)
      window.addEventListener('scroll', handleActivity)

      return () => {
        window.removeEventListener('mousemove', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('click', handleActivity)
        window.removeEventListener('scroll', handleActivity)
      }
    }
  }, [isAuthenticated])

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
