"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type User, getAuthState, login as authLogin, register as authRegister, logout as authLogout, updateActivity } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load auth state immediately (synchronous)
  const initialState = getAuthState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Revalidate auth state on mount (in case of stale data)
    const state = getAuthState()
    if (state.user !== user || state.isAuthenticated !== isAuthenticated) {
    setUser(state.user)
    setIsAuthenticated(state.isAuthenticated)
    }

    // Track user activity for session management
    if (state.isAuthenticated) {
      const handleActivity = () => updateActivity()
      
      // Listen to user activity events
      window.addEventListener('mousemove', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('click', handleActivity)
      window.addEventListener('scroll', handleActivity)

      // Cleanup event listeners
      return () => {
        window.removeEventListener('mousemove', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('click', handleActivity)
        window.removeEventListener('scroll', handleActivity)
      }
    }
  }, [isAuthenticated])

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const result = await authRegister(email, password, firstName, lastName)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const logout = async () => {
    await authLogout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
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
